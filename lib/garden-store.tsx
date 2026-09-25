import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { findTask, PLANTS_DATA, type Plant, type PlantTask, type TaskStatus } from '@/constants/plants';

const STORAGE_KEY = 'garden_progress_v1';
export const XP_PER_LEVEL = 500;

type TaskStatusMap = Record<string, TaskStatus>;

interface GardenState {
    taskStatus: TaskStatusMap;
    xp: number;
}

export interface PlantProgress {
    completed: number;
    total: number;
    percent: number;
    /** Tugas yang sedang aktif, undefined jika semua tugas selesai. */
    activeTask?: PlantTask;
}

export interface LevelInfo {
    level: number;
    xpIntoLevel: number;
    xpForNextLevel: number;
}

interface GardenContextValue extends GardenState {
    ready: boolean;
    /** Tandai tugas aktif selesai, buka tugas berikutnya. Mengembalikan XP yang didapat (0 jika tidak valid). */
    completeTask: (taskId: string) => number;
}

function seedState(): GardenState {
    const taskStatus: TaskStatusMap = {};
    let xp = 0;
    for (const plant of PLANTS_DATA) {
        for (const task of plant.tasks) {
            taskStatus[task.id] = task.status;
            if (task.status === 'completed') xp += task.xp;
        }
    }
    return { taskStatus, xp };
}

export function getPlantProgress(plant: Plant, taskStatus: TaskStatusMap): PlantProgress {
    const total = plant.tasks.length;
    const completed = plant.tasks.filter(t => taskStatus[t.id] === 'completed').length;
    return {
        completed,
        total,
        percent: total === 0 ? 0 : Math.round((completed / total) * 100),
        activeTask: plant.tasks.find(t => taskStatus[t.id] === 'active'),
    };
}

export function getLevelInfo(xp: number): LevelInfo {
    return {
        level: Math.floor(xp / XP_PER_LEVEL) + 1,
        xpIntoLevel: xp % XP_PER_LEVEL,
        xpForNextLevel: XP_PER_LEVEL,
    };
}

const GardenContext = createContext<GardenContextValue | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<GardenState>(seedState);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY)
            .then(raw => {
                if (!raw) return;
                const saved = JSON.parse(raw) as Partial<GardenState>;
                // Gabungkan dengan seed agar tugas baru di PLANTS_DATA tetap punya status.
                setState(prev => ({
                    taskStatus: { ...prev.taskStatus, ...saved.taskStatus },
                    xp: typeof saved.xp === 'number' ? saved.xp : prev.xp,
                }));
            })
            .catch(error => console.warn('Gagal memuat progres kebun:', error))
            .finally(() => setReady(true));
    }, []);

    // Simpan hanya setelah data tersimpan dimuat, supaya seed tidak menimpanya.
    useEffect(() => {
        if (!ready) return;
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(error =>
            console.warn('Gagal menyimpan progres kebun:', error),
        );
    }, [state, ready]);

    const completeTask = useCallback(
        (taskId: string) => {
            const found = findTask(taskId);
            if (!found || state.taskStatus[taskId] !== 'active') return 0;

            const { plant, task } = found;
            setState(prev => {
                // Cegah XP ganda jika tombol ditekan dua kali sebelum re-render.
                if (prev.taskStatus[taskId] !== 'active') return prev;
                const nextTask = plant.tasks
                    .slice(plant.tasks.indexOf(task) + 1)
                    .find(t => prev.taskStatus[t.id] === 'locked');
                return {
                    xp: prev.xp + task.xp,
                    taskStatus: {
                        ...prev.taskStatus,
                        [task.id]: 'completed',
                        ...(nextTask ? { [nextTask.id]: 'active' } : {}),
                    },
                };
            });
            return task.xp;
        },
        [state.taskStatus],
    );

    const value = useMemo(() => ({ ...state, ready, completeTask }), [state, ready, completeTask]);

    return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden(): GardenContextValue {
    const context = useContext(GardenContext);
    if (!context) throw new Error('useGarden harus dipakai di dalam <GardenProvider>');
    return context;
}

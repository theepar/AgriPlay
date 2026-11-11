import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { getPlantById } from '@/constants/plants';
import { GardenProvider, getLevelInfo, getPlantProgress, useGarden } from '@/lib/garden-store';

const STORAGE_KEY = 'garden_progress_v1';
const wrapper = ({ children }: { children: ReactNode }) => <GardenProvider>{children}</GardenProvider>;

async function renderGarden() {
    const hook = renderHook(() => useGarden(), { wrapper });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    return hook;
}

beforeEach(async () => {
    await AsyncStorage.clear();
});

describe('getLevelInfo', () => {
    it('naik level setiap 500 XP', () => {
        expect(getLevelInfo(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNextLevel: 500 });
        expect(getLevelInfo(499).level).toBe(1);
        expect(getLevelInfo(500)).toEqual({ level: 2, xpIntoLevel: 0, xpForNextLevel: 500 });
        expect(getLevelInfo(1234)).toEqual({ level: 3, xpIntoLevel: 234, xpForNextLevel: 500 });
    });
});

describe('GardenProvider', () => {
    it('mulai dari seed: 300 XP, kentang 2/6 tugas', async () => {
        const { result } = await renderGarden();
        const potato = getPlantById('1')!;
        const progress = getPlantProgress(potato, result.current.taskStatus);

        expect(result.current.xp).toBe(300);
        expect(progress).toMatchObject({ completed: 2, total: 6, percent: 33 });
        expect(progress.activeTask?.id).toBe('1-3');
    });

    it('menyelesaikan tugas aktif memberi XP dan membuka tugas berikutnya', async () => {
        const { result } = await renderGarden();

        let gained = 0;
        act(() => {
            gained = result.current.completeTask('1-3');
        });

        expect(gained).toBe(200);
        expect(result.current.xp).toBe(500);
        expect(result.current.taskStatus['1-3']).toBe('completed');
        expect(result.current.taskStatus['1-4']).toBe('active');
    });

    it('tidak memberi XP ganda saat ditekan dua kali sebelum re-render', async () => {
        const { result } = await renderGarden();
        const { completeTask } = result.current;

        act(() => {
            completeTask('1-3');
            completeTask('1-3');
        });

        expect(result.current.xp).toBe(500);
    });

    it('menolak tugas yang terkunci, sudah selesai, atau tidak dikenal', async () => {
        const { result } = await renderGarden();

        act(() => {
            expect(result.current.completeTask('1-6')).toBe(0);
            expect(result.current.completeTask('1-1')).toBe(0);
            expect(result.current.completeTask('tidak-ada')).toBe(0);
        });

        expect(result.current.xp).toBe(300);
    });

    it('menyimpan progres dan memulihkannya saat app dibuka ulang', async () => {
        const first = await renderGarden();
        act(() => {
            first.result.current.completeTask('2-1');
        });
        await waitFor(async () => {
            const saved = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? '{}');
            expect(saved.taskStatus?.['2-1']).toBe('completed');
        });
        first.unmount();

        const second = await renderGarden();
        expect(second.result.current.taskStatus['2-1']).toBe('completed');
        expect(second.result.current.taskStatus['2-2']).toBe('active');
        expect(second.result.current.xp).toBe(400);
    });

    it('membuka tugas baru yang ditambahkan setelah semua tugas lama selesai', async () => {
        // Simulasi data lama: tugas 1-6 belum ada saat progres disimpan.
        await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                xp: 850,
                taskStatus: { '1-1': 'completed', '1-2': 'completed', '1-3': 'completed', '1-4': 'completed', '1-5': 'completed' },
            }),
        );

        const { result } = await renderGarden();
        const progress = getPlantProgress(getPlantById('1')!, result.current.taskStatus);

        expect(progress.activeTask?.id).toBe('1-6');
    });

    it('tetap jalan dengan seed jika data tersimpan rusak', async () => {
        await AsyncStorage.setItem(STORAGE_KEY, '{rusak');
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const { result } = await renderGarden();

        expect(result.current.xp).toBe(300);
        warn.mockRestore();
    });
});

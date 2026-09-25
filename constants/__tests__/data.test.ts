import { CROP_CATALOG, getCropInfo } from '@/constants/crops';
import { findTask, getPlantById, PLANTS_DATA } from '@/constants/plants';

describe('PLANTS_DATA', () => {
    it('ID tanaman dan tugas unik', () => {
        const plantIds = PLANTS_DATA.map(p => p.id);
        const taskIds = PLANTS_DATA.flatMap(p => p.tasks.map(t => t.id));
        expect(new Set(plantIds).size).toBe(plantIds.length);
        expect(new Set(taskIds).size).toBe(taskIds.length);
    });

    it.each(PLANTS_DATA.map(p => [p.name, p] as const))('%s: totalXp = jumlah XP tugas', (_name, plant) => {
        expect(plant.totalXp).toBe(plant.tasks.reduce((sum, t) => sum + t.xp, 0));
    });

    it.each(PLANTS_DATA.map(p => [p.name, p] as const))(
        '%s: urutan status seed valid (selesai → 1 aktif → terkunci)',
        (_name, plant) => {
            const order = plant.tasks.map(t => t.status).join(',');
            expect(order).toMatch(/^(completed,)*active(,locked)*$/);
        },
    );

    it('helper pencarian', () => {
        expect(getPlantById('2')?.name).toBe('Tomat Cherry');
        expect(getPlantById(['2'])).toBeUndefined();
        expect(findTask('3-2')?.plant.id).toBe('3');
        expect(findTask('x')).toBeUndefined();
    });
});

describe('CROP_CATALOG', () => {
    it('berisi 14 label model ML', () => {
        expect(Object.keys(CROP_CATALOG)).toHaveLength(14);
    });

    it.each(Object.entries(CROP_CATALOG).filter(([, c]) => c.plantId))('%s menunjuk ke tanaman yang ada', (_label, crop) => {
        expect(getPlantById(crop.plantId)).toBeDefined();
    });

    it('label tidak peka huruf besar/kecil', () => {
        expect(getCropInfo('Tomatoes').name).toBe('Tomat');
    });

    it('label yang belum dikenal tetap ditampilkan', () => {
        const info = getCropInfo('rice');
        expect(info.name).toBe('Rice');
        expect(info.plantId).toBeUndefined();
    });
});

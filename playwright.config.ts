import { defineConfig } from '@playwright/test';

const PORT = 8082;

// E2E berjalan di build web produksi (expo export). API ML, cuaca, dan gambar di-mock
// di dalam test sehingga hasilnya tidak bergantung jaringan.
export default defineConfig({
    testDir: './e2e',
    timeout: 60_000,
    retries: 0,
    reporter: [['list']],
    use: {
        baseURL: `http://localhost:${PORT}`,
        trace: 'retain-on-failure',
        geolocation: { latitude: -6.9175, longitude: 107.6191 },
        permissions: ['geolocation'],
        locale: 'id-ID',
    },
    projects: [
        { name: 'hp-kecil-375', use: { viewport: { width: 375, height: 812 } } },
        { name: 'hp-390', use: { viewport: { width: 390, height: 844 } } },
    ],
    webServer: {
        command: `npx expo export --platform web --output-dir dist && npx expo serve --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
    },
});

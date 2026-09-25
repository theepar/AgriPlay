import { expect, test, type Page } from '@playwright/test';
import path from 'node:path';

const ML_API = '**/crop_recommendation_fastapi';

let consoleErrors: string[] = [];

test.beforeEach(async ({ page, context }) => {
    consoleErrors = [];
    page.on('pageerror', error => consoleErrors.push(error.message));
    page.on('console', message => {
        if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('dialog', dialog => dialog.accept());

    // Tidak ada request keluar yang sungguhan: gambar & CDN dibatalkan, API di-mock.
    await context.route(/unsplash\.com|unpkg\.com|tile\.openstreetmap\.org/, route => route.abort());
    await context.route('https://api.open-meteo.com/**', route =>
        route.fulfill({ json: { current_weather: { temperature: 28.4, weathercode: 2 } } }),
    );
    await context.route(ML_API, route => route.fulfill({ json: { plant: 'tomatoes' } }));
});

test.afterEach(() => {
    // Gambar/CDN yang sengaja dibatalkan memunculkan "Failed to load resource"; selain itu harus bersih.
    const unexpected = consoleErrors.filter(text => !/Failed to load resource/.test(text));
    expect(unexpected).toEqual([]);
});

async function login(page: Page, email = 'budi.santoso@example.com') {
    await page.goto('/');
    await page.getByRole('button', { name: 'Lewati' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill('rahasia123');
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();
    await expect(page.getByText(`Halo, ${email.split('@')[0]}!`)).toBeVisible();
}

test('onboarding → validasi login → beranda dengan nama & cuaca', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Selamat Datang', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Lewati' }).click();

    await page.getByRole('button', { name: 'Masuk', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Masukkan alamat email yang valid');

    await page.getByRole('textbox', { name: 'Email' }).fill('budi.santoso@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('rahasia123');
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('Halo, budi.santoso!')).toBeVisible();
    await expect(page.getByLabel(/Cuaca 28 derajat, Berawan/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Kentang Granola, progres 33 persen/ })).toBeVisible();
});

test('menyelesaikan tugas menambah XP, membuka tugas berikutnya, dan tersimpan', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /Misi Harian/ }).click();
    await page.getByRole('button', { name: /Kentang Granola, Sedang, progres 33 persen/ }).click();
    await page.getByRole('button', { name: /^Penanaman Awal/ }).click();

    await page.getByRole('button', { name: 'Tandai Selesai' }).click();
    await expect(page.getByText('Rangkaian Misi')).toBeVisible();
    await expect(page.getByText('50%').filter({ visible: true })).toBeVisible();

    await page.reload();
    await expect(page.getByText('50%').filter({ visible: true })).toBeVisible();

    await page.goto('/missions/task/1-3');
    await expect(page.getByRole('button', { name: 'Sudah Selesai ✓' })).toBeDisabled();
    await page.goto('/missions/task/1-5');
    await expect(page.getByRole('button', { name: 'Masih Terkunci' })).toBeDisabled();

    await page.goto('/profile');
    await expect(page.getByText('0 / 500 XP')).toBeVisible();
    await expect(page.getByText('Menuju Level 3')).toBeVisible();
});

test('logout kembali ke login dan sesi tidak dipulihkan', async ({ page }) => {
    await login(page);
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Keluar' }).click();
    await expect(page.getByText('Masuk untuk mulai merawat tanamanmu.')).toBeVisible();

    await page.goto('/');
    await expect(page.getByText('Masuk untuk mulai merawat tanamanmu.')).toBeVisible();
});

test('daftar: validasi lalu langsung masuk dengan nama pengguna', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Lewati' }).click();
    await page.getByRole('button', { name: 'Daftar Sekarang' }).click();

    await page.getByRole('textbox', { name: 'Username' }).fill('Siti Aminah');
    await page.getByRole('textbox', { name: 'Email' }).fill('siti@example.com');
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('pendek');
    await page.getByRole('textbox', { name: 'Konfirmasi password' }).fill('pendek');
    await page.getByRole('button', { name: 'Daftar Sekarang' }).click();
    await expect(page.getByRole('alert')).toContainText('Password minimal 8 karakter');

    await page.getByRole('textbox', { name: 'Password', exact: true }).fill('panjang123');
    await page.getByRole('textbox', { name: 'Konfirmasi password' }).fill('panjang124');
    await page.getByRole('button', { name: 'Daftar Sekarang' }).click();
    await expect(page.getByRole('alert')).toContainText('Konfirmasi password tidak cocok');

    await page.getByRole('textbox', { name: 'Konfirmasi password' }).fill('panjang123');
    await page.getByRole('button', { name: 'Daftar Sekarang' }).click();
    await expect(page.getByText('Halo, Siti Aminah!')).toBeVisible();
});

test('hasil rekomendasi: nama Indonesia dan tombol menuju misi terkait', async ({ page }) => {
    await login(page);
    let request: unknown;
    await page.route(ML_API, async route => {
        request = route.request().postDataJSON();
        await route.fulfill({ json: { plant: 'tomatoes' } });
    });

    await page.goto('/plant-recommendations-result?location=Bandung&experience=pemula&sunCondition=partial&latitude=-6.9175&longitude=107.6191');
    await expect(page.getByRole('heading', { name: 'Tomat' })).toBeVisible();
    expect(request).toMatchObject({ sun_exposure: 'Partial Shade', location: { lat: -6.9175, lon: 107.6191 } });

    await page.getByRole('button', { name: 'Mulai Misi Tanaman Ini' }).click();
    await expect(page.getByRole('heading', { name: 'Tomat Cherry' })).toBeVisible();
});

test('hasil rekomendasi: error server lalu berhasil setelah Coba Lagi', async ({ page }) => {
    await login(page);
    let calls = 0;
    await page.route(ML_API, route => {
        calls += 1;
        return calls === 1 ? route.fulfill({ status: 502, json: {} }) : route.fulfill({ json: { plant: 'vanilla' } });
    });

    await page.goto('/plant-recommendations-result?location=Bogor&experience=pemula&sunCondition=full&latitude=-6.6&longitude=106.8');
    await expect(page.getByRole('alert')).toContainText('Sumber data iklim sedang tidak dapat diakses');

    await page.getByRole('button', { name: 'Coba Lagi' }).click();
    await expect(page.getByRole('heading', { name: 'Vanili' })).toBeVisible();
    await expect(page.getByText(/cukup menantang untuk pemula/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lihat Misi yang Tersedia' })).toBeVisible();
});

test('wizard: pilihan pengalaman berperan sebagai radio', async ({ page }) => {
    await login(page);
    await page.goto('/plant-recommendation');
    const next = page.getByRole('button', { name: 'Selanjutnya' });
    await expect(next).toBeDisabled();

    await page.getByRole('radio', { name: /Pemula/ }).click();
    await expect(page.getByRole('radio', { name: /Pemula/ })).toBeChecked();
    await expect(next).toBeEnabled();
});

// Meniru hosting statis yang dikonfigurasi sesuai dokumentasi Expo:
// URL tak dikenal -> +not-found.html, ID dinamis -> template [id].html.
async function serveLikeHost(page: Page, url: string, file: string) {
    await page.route(url, route => route.fulfill({ path: path.join('dist', file), contentType: 'text/html' }));
}

test('tautan yang tidak ada menampilkan halaman 404 yang bisa kembali ke beranda', async ({ page }) => {
    await login(page);
    await serveLikeHost(page, '**/halaman-yang-tidak-ada', '+not-found.html');
    await serveLikeHost(page, '**/missions/999', 'missions/[id].html');
    await page.goto('/halaman-yang-tidak-ada');
    await expect(page.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeVisible();

    await page.goto('/missions/999');
    await expect(page.getByRole('heading', { name: 'Misi tidak ditemukan' })).toBeVisible();
    await page.getByRole('button', { name: 'Ke Beranda' }).click();
    await expect(page.getByText('Halo, budi.santoso!')).toBeVisible();
});

test('aksesibilitas: setiap tombol yang terlihat punya nama', async ({ page }) => {
    await login(page);
    for (const path of ['/', '/missions', '/missions/1', '/missions/task/1-3', '/plant-detail?id=2', '/profile', '/virtual-garden', '/chatbot']) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        const buttons = page.getByRole('button');
        const count = await buttons.count();
        expect(count, `${path} punya tombol`).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            const button = buttons.nth(i);
            if (!(await button.isVisible())) continue;
            const name = ((await button.getAttribute('aria-label')) ?? (await button.innerText())).trim();
            expect(name, `${path}: tombol ke-${i} tanpa nama`).not.toBe('');
        }
    }
});

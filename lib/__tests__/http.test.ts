import { fetchJson, RequestError } from '@/lib/http';

const originalFetch = global.fetch;

function mockFetch(impl: (url: string, init: RequestInit) => Promise<Response>) {
    global.fetch = jest.fn(impl) as unknown as typeof fetch;
}

function jsonResponse(body: string, status = 200) {
    return { ok: status >= 200 && status < 300, status, json: async () => JSON.parse(body) } as Response;
}

afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
});

describe('fetchJson', () => {
    it('mengembalikan JSON jika sukses', async () => {
        mockFetch(async () => jsonResponse('{"plant":"tomatoes"}'));
        await expect(fetchJson('https://x')).resolves.toEqual({ plant: 'tomatoes' });
    });

    it('status non-2xx menjadi error "http" dengan status', async () => {
        mockFetch(async () => jsonResponse('{}', 502));
        await expect(fetchJson('https://x')).rejects.toMatchObject({ kind: 'http', status: 502 });
    });

    it('respons 200 yang bukan JSON menjadi error "http", bukan "network"', async () => {
        mockFetch(async () => jsonResponse('<html>bukan json</html>'));
        await expect(fetchJson('https://x')).rejects.toMatchObject({ kind: 'http', status: 200 });
    });

    it('gagal koneksi menjadi error "network"', async () => {
        mockFetch(async () => {
            throw new TypeError('Network request failed');
        });
        await expect(fetchJson('https://x')).rejects.toMatchObject({ kind: 'network' });
    });

    it('membatalkan request yang melebihi batas waktu', async () => {
        jest.useFakeTimers();
        mockFetch(
            (_url, init) =>
                new Promise((_resolve, reject) => {
                    init.signal?.addEventListener('abort', () => reject(new Error('Aborted')));
                }),
        );

        const request = fetchJson('https://x', {}, 1000);
        jest.advanceTimersByTime(1000);

        await expect(request).rejects.toBeInstanceOf(RequestError);
        await expect(request).rejects.toMatchObject({ kind: 'timeout' });
    });
});

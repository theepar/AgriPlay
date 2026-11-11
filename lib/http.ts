// Catatan: polyfill AbortSignal bawaan React Native tidak memiliki
// AbortSignal.timeout(), jadi timeout dibuat manual dengan AbortController.

export type RequestErrorKind = 'timeout' | 'network' | 'http';

export class RequestError extends Error {
    constructor(
        message: string,
        readonly kind: RequestErrorKind,
        readonly status?: number,
    ) {
        super(message);
        this.name = 'RequestError';
    }
}

/**
 * fetch + parse JSON dengan batas waktu. Melempar RequestError agar UI bisa
 * menampilkan pesan yang sesuai (timeout, jaringan, atau error server).
 */
export async function fetchJson<T>(url: string, init: RequestInit = {}, timeoutMs = 15000): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, { ...init, signal: controller.signal });
        if (!response.ok) {
            throw new RequestError(`Server merespons dengan status ${response.status}`, 'http', response.status);
        }
        try {
            return (await response.json()) as T;
        } catch (error) {
            if (controller.signal.aborted) throw error;
            throw new RequestError('Respons server tidak valid', 'http', response.status);
        }
    } catch (error) {
        if (error instanceof RequestError) throw error;
        if (controller.signal.aborted) {
            throw new RequestError('Permintaan melebihi batas waktu', 'timeout');
        }
        throw new RequestError('Tidak dapat terhubung ke server', 'network');
    } finally {
        clearTimeout(timer);
    }
}

import Constants from 'expo-constants';

import { fetchJson, RequestError } from '@/lib/http';

// 🚀 PRODUCTION ML API (configured in app.json)
// Edit ML API URL di: app.json -> extra -> mlApiUrl
// - Android Emulator (server lokal): http://10.0.2.2:8000
// - Physical device (server lokal): http://<IP_KOMPUTER>:8000
const ML_API_BASE_URL: string = Constants.expoConfig?.extra?.mlApiUrl || 'https://theparr-agrarian-ml-api.hf.space';

// Server gratis (Hugging Face Spaces) bisa "tidur". Request pertama + unduh
// data iklim NASA 10 tahun bisa memakan waktu hingga ~1 menit.
const ML_TIMEOUT_MS = 90_000;

if (__DEV__) {
    console.log('🌾 ML API URL:', ML_API_BASE_URL);
}

// ============ TYPES ============

export interface CropRecommendationRequest {
    /** Belum dipakai oleh model saat ini, tetap dikirim untuk kompatibilitas. */
    tingkat_komitmen: 'beginner' | 'intermediate' | 'expert';
    location: {
        lat: number;
        lon: number;
    };
    sun_exposure: 'Full Sun' | 'Partial Shade' | 'Shade';
    /** Luas lahan (m²). Belum dipakai oleh model saat ini. */
    area: number;
}

export interface CropRecommendationResponse {
    plant: string;
}

export interface YieldPredictionRequest {
    plant: {
        name: string;
        base_temp: number;
        growing_days: number;
    };
    location: {
        lat: number;
        lon: number;
    };
    /** Format YYYY-MM-DD */
    startDate: string;
    area: number;
}

export interface YieldPredictionResponse {
    predicted_yield: number;
    units: string;
}

// ============ MAPPING HELPERS ============

// Map experience level from Indonesian to API format
export function mapExperienceToAPI(experience: string): 'beginner' | 'intermediate' | 'expert' {
    switch (experience) {
        case 'pemula':
            return 'beginner';
        case 'menengah':
            return 'intermediate';
        case 'mahir':
            return 'expert';
        default:
            return 'beginner';
    }
}

// Map sun condition from app format to API format
export function mapSunConditionToAPI(sunCondition: string): 'Full Sun' | 'Partial Shade' | 'Shade' {
    switch (sunCondition) {
        case 'full':
            return 'Full Sun';
        case 'partial':
            return 'Partial Shade';
        case 'shade':
            return 'Shade';
        default:
            return 'Full Sun';
    }
}

/** Pesan error yang ramah pengguna untuk kegagalan ML API. */
export function describeApiError(error: unknown): string {
    if (error instanceof RequestError) {
        if (error.kind === 'timeout') {
            return 'Server AI terlalu lama merespons. Server mungkin sedang "bangun", coba lagi dalam beberapa saat.';
        }
        if (error.kind === 'network') {
            return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
        }
        if (error.status === 422) {
            return 'Data yang dikirim tidak valid. Coba pilih ulang lokasi atau kondisi lahan.';
        }
        if (error.status === 502) {
            return 'Sumber data iklim sedang tidak dapat diakses. Coba lagi nanti.';
        }
    }
    return 'Server AI sedang bermasalah. Coba lagi nanti.';
}

// ============ API FUNCTIONS ============

function postJson<T>(path: string, body: unknown): Promise<T> {
    return fetchJson<T>(
        `${ML_API_BASE_URL}${path}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        },
        ML_TIMEOUT_MS,
    );
}

/**
 * Get crop recommendation based on location and preferences
 */
export async function getCropRecommendation(
    data: CropRecommendationRequest
): Promise<CropRecommendationResponse> {
    if (__DEV__) console.log('Sending to ML API:', JSON.stringify(data));
    const result = await postJson<CropRecommendationResponse>('/crop_recommendation_fastapi', data);
    if (__DEV__) console.log('ML API Response:', result);
    return result;
}

/**
 * Get yield prediction for a specific crop at location
 * (endpoint masih tahap pengembangan di sisi server)
 */
export function getYieldPrediction(data: YieldPredictionRequest): Promise<YieldPredictionResponse> {
    return postJson<YieldPredictionResponse>('/yield_prediction_fastapi', data);
}

/**
 * Check if ML API is available
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        await fetchJson(`${ML_API_BASE_URL}/`, {}, 10_000);
        return true;
    } catch {
        return false;
    }
}

// Export base URL for configuration
export { ML_API_BASE_URL };

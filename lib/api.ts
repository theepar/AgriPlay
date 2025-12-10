/**
 * ML API Service Layer
 * Connects AgriPlay to the ML Model Agrarian API
 */

// Base URL Configuration
// - Android Emulator: use 10.0.2.2 (localhost alias)
// - iOS Simulator: use localhost
// - Physical device: use your computer's IP address (e.g., 192.168.1.x)
const ML_API_BASE_URL = 'http://10.0.2.2:8000';

// ============ TYPES ============

export interface CropRecommendationRequest {
    tingkat_komitmen: 'beginner' | 'intermediate' | 'expert';
    location: {
        lat: number;
        lon: number;
    };
    sun_exposure: 'Full Sun' | 'Partial Shade' | 'Shade';
    area: number;
}

export interface CropRecommendationResponse {
    plant: string;
}

export interface YieldPredictionRequest {
    latitude: number;
    longitude: number;
    crop: string;
}

export interface YieldPredictionResponse {
    predicted_yield?: number;
    unit?: string;
    status?: string;
    message?: string;
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

// ============ API FUNCTIONS ============

/**
 * Get crop recommendation based on location and preferences
 */
export async function getCropRecommendation(
    data: CropRecommendationRequest
): Promise<CropRecommendationResponse> {
    try {
        console.log('Sending to ML API:', JSON.stringify(data, null, 2));

        const response = await fetch(`${ML_API_BASE_URL}/crop_recommendation_fastapi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('ML API Response:', result);
        return result;
    } catch (error) {
        console.error('Error fetching crop recommendation:', error);
        throw error;
    }
}

/**
 * Get yield prediction for a specific crop at location
 */
export async function getYieldPrediction(
    latitude: number,
    longitude: number,
    crop: string
): Promise<YieldPredictionResponse> {
    try {
        const response = await fetch(`${ML_API_BASE_URL}/yield_prediction_fastapi`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latitude,
                longitude,
                crop,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching yield prediction:', error);
        throw error;
    }
}

/**
 * Check if ML API is available
 */
export async function checkApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${ML_API_BASE_URL}/`, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        console.error('ML API health check failed:', error);
        return false;
    }
}

// ============ CROP DESCRIPTIONS ============

const CROP_DESCRIPTIONS: Record<string, string> = {
    'onions and shallots': 'Bawang merah dan bawang bombay adalah tanaman umbi yang mudah ditanam dan cocok untuk pemula. Tanaman ini tahan terhadap berbagai kondisi cuaca dan membutuhkan sinar matahari penuh untuk pertumbuhan optimal.',
    'rice': 'Padi adalah tanaman pangan utama yang membutuhkan banyak air dan iklim tropis. Cocok untuk lahan basah dengan sistem irigasi yang baik.',
    'maize': 'Jagung adalah tanaman serbaguna yang dapat tumbuh di berbagai jenis tanah. Membutuhkan sinar matahari penuh dan penyiraman teratur.',
    'cassava': 'Singkong adalah tanaman umbi yang sangat tahan kekeringan dan mudah dibudidayakan. Ideal untuk lahan marginal dengan perawatan minimal.',
    'potatoes': 'Kentang adalah tanaman umbi yang produktif dan mudah ditanam. Membutuhkan tanah gembur dan suhu sejuk untuk hasil optimal.',
    'soybeans': 'Kedelai adalah tanaman kacang-kacangan kaya protein yang juga memperbaiki kesuburan tanah. Cocok untuk rotasi tanaman.',
    'vegetables': 'Sayuran hijau seperti bayam, kangkung, dan sawi mudah ditanam dan cepat panen. Ideal untuk kebun rumah dengan perawatan minimal.',
    'tomatoes': 'Tomat adalah tanaman buah yang produktif dan serbaguna. Membutuhkan sinar matahari penuh dan penyangga untuk pertumbuhan vertikal.',
    'chillies': 'Cabai adalah tanaman yang mudah ditanam dan berbuah lebat. Cocok untuk ditanam di pot atau kebun dengan sinar matahari penuh.',
    'sugar cane': 'Tebu adalah tanaman industri yang membutuhkan iklim tropis dan banyak air. Masa tanam panjang tetapi hasil melimpah.',
};

/**
 * Get description for a crop
 */
export function getCropDescription(plantName: string): string {
    const key = plantName.toLowerCase();
    return CROP_DESCRIPTIONS[key] || `${plantName} adalah tanaman yang cocok untuk kondisi lahan dan iklim Anda berdasarkan analisis AI. Tanaman ini direkomendasikan karena sesuai dengan level pengalaman dan kondisi pencahayaan yang tersedia.`;
}

// Export base URL for configuration
export { ML_API_BASE_URL };


// Base URL Configuration
// - Android Emulator: use 10.0.2.2 (localhost alias)
// - iOS Simulator: use localhost
// - Physical device: use your computer's IP address (e.g., 192.168.1.x)

import Constants from 'expo-constants';

// 🚀 PRODUCTION ML API (configured in app.json)
// Edit ML API URL di: app.json -> extra -> mlApiUrl
const ML_API_BASE_URL = Constants.expoConfig?.extra?.mlApiUrl || 'https://theparr-agrarian-ml-api.hf.space';

// Log untuk debugging (hapus di production)
console.log('🌾 ML API URL:', ML_API_BASE_URL);



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
    'beans': 'Kacang-kacangan adalah tanaman yang kaya protein dan mudah ditanam. Cocok untuk pemula karena perawatannya minimal dan dapat memperbaiki kesuburan tanah secara alami.',
    'carrots and turnips': 'Wortel dan lobak adalah tanaman umbi yang kaya nutrisi dan mudah dibudidayakan. Membutuhkan tanah gembur dan penyiraman teratur untuk hasil optimal.',
    'chillies and peppers': 'Cabai dan paprika adalah tanaman yang produktif dan berbuah lebat. Cocok untuk ditanam di pot atau kebun dengan sinar matahari penuh.',
    'cinnamon and cinnamon-tree flowers': 'Kayu manis adalah tanaman rempah bernilai tinggi yang berasal dari kulit pohon. Membutuhkan iklim tropis lembab dan waktu panen yang panjang.',
    'cloves': 'Cengkeh adalah tanaman rempah aromatik yang sangat berharga. Membutuhkan iklim tropis dengan curah hujan tinggi dan tanah vulkanik yang subur.',
    'cucumbers and gherkins': 'Mentimun dan acar adalah tanaman merambat yang cepat tumbuh dan produktif. Cocok untuk pemula dengan kebutuhan air yang cukup banyak.',
    'eggplants': 'Terong adalah tanaman buah yang mudah ditanam dan berbuah lebat. Membutuhkan sinar matahari penuh dan penyiraman teratur.',
    'leeks and other alliaceous vegetables': 'Daun bawang dan keluarga bawang-bawangan mudah ditanam dan serba guna di dapur. Cocok untuk berbagai kondisi tanah dan iklim.',
    'onions and shallots': 'Bawang merah dan bawang bombay adalah tanaman umbi yang mudah ditanam dan cocok untuk pemula. Tanaman ini tahan terhadap berbagai kondisi cuaca.',
    'pepper': 'Lada adalah tanaman rempah merambat yang bernilai ekonomi tinggi. Membutuhkan iklim tropis lembab dengan sistem penyangga yang baik.',
    'potatoes': 'Kentang adalah tanaman umbi yang produktif dan mudah ditanam. Membutuhkan tanah gembur dan suhu sejuk untuk hasil optimal.',
    'tea leaves': 'Teh adalah tanaman perkebunan yang tumbuh baik di dataran tinggi. Membutuhkan iklim sejuk dengan curah hujan merata sepanjang tahun.',
    'tomatoes': 'Tomat adalah tanaman buah yang produktif dan serbaguna. Membutuhkan sinar matahari penuh dan penyangga untuk pertumbuhan vertikal.',
    'vanilla': 'Vanili adalah tanaman rempah merambat dengan nilai ekonomi sangat tinggi. Membutuhkan pohon penyangga, iklim tropis lembab, dan penyerbukan manual.',
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


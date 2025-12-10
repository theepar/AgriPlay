/**
 * ML API Service Layer
 * Connects AgriPlay to the ML Model Agrarian API
 */

// Base URL Configuration
// - Android Emulator: use 10.0.2.2 (localhost alias)
// - iOS Simulator: use localhost
// - Physical device: use your computer's IP address
const ML_API_BASE_URL = 'http://172.18.176.1:8000';

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

// Export base URL for configuration
export { ML_API_BASE_URL };


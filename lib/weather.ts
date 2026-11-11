import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { fetchJson } from '@/lib/http';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface CurrentWeather {
    temp: number;
    description: string;
    icon: IoniconName;
}

/** Terjemahkan WMO weather code (Open-Meteo) ke label & ikon. */
export function describeWeatherCode(code: number): { description: string; icon: IoniconName } {
    if (code === 0) return { description: 'Cerah', icon: 'sunny' };
    if (code >= 1 && code <= 3) return { description: 'Berawan', icon: 'partly-sunny' };
    if (code >= 45 && code <= 48) return { description: 'Berkabut', icon: 'cloudy' };
    if (code >= 51 && code <= 67) return { description: 'Hujan Ringan', icon: 'rainy' };
    if (code >= 80 && code <= 82) return { description: 'Hujan Deras', icon: 'rainy' };
    if (code >= 95 && code <= 99) return { description: 'Hujan Petir', icon: 'thunderstorm' };
    return { description: 'Cerah', icon: 'sunny' };
}

/** Cuaca saat ini dari Open-Meteo (tanpa API key). */
export async function fetchCurrentWeather(latitude: number, longitude: number): Promise<CurrentWeather> {
    const data = await fetchJson<{ current_weather: { temperature: number; weathercode: number } }>(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
        {},
        8000,
    );
    const { temperature, weathercode } = data.current_weather;
    return { temp: Math.round(temperature), ...describeWeatherCode(weathercode) };
}

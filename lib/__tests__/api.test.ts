import { describeApiError, mapExperienceToAPI, mapSunConditionToAPI } from '@/lib/api';
import { RequestError } from '@/lib/http';
import { describeWeatherCode } from '@/lib/weather';

describe('mapping ke format API', () => {
    it.each([
        ['pemula', 'beginner'],
        ['menengah', 'intermediate'],
        ['mahir', 'expert'],
        ['lainnya', 'beginner'],
    ])('pengalaman %s → %s', (input, expected) => {
        expect(mapExperienceToAPI(input)).toBe(expected);
    });

    it.each([
        ['full', 'Full Sun'],
        ['partial', 'Partial Shade'],
        ['shade', 'Shade'],
        ['lainnya', 'Full Sun'],
    ])('matahari %s → %s', (input, expected) => {
        expect(mapSunConditionToAPI(input)).toBe(expected);
    });
});

describe('describeApiError', () => {
    it.each([
        [new RequestError('', 'timeout'), /terlalu lama/],
        [new RequestError('', 'network'), /koneksi internet/],
        [new RequestError('', 'http', 422), /tidak valid/],
        [new RequestError('', 'http', 502), /data iklim/],
        [new RequestError('', 'http', 500), /bermasalah/],
        [new Error('lain'), /bermasalah/],
    ])('%o', (error, message) => {
        expect(describeApiError(error)).toMatch(message);
    });
});

describe('describeWeatherCode', () => {
    it.each([
        [0, 'Cerah', 'sunny'],
        [2, 'Berawan', 'partly-sunny'],
        [45, 'Berkabut', 'cloudy'],
        [61, 'Hujan Ringan', 'rainy'],
        [81, 'Hujan Deras', 'rainy'],
        [95, 'Hujan Petir', 'thunderstorm'],
    ])('kode %i → %s', (code, description, icon) => {
        expect(describeWeatherCode(code)).toEqual({ description, icon });
    });
});

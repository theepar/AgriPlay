import { render, screen, waitFor } from '@testing-library/react-native';

import PlantRecommendationResultScreen from '@/app/plant-recommendations-result';
import { getCropRecommendation } from '@/lib/api';
import { RequestError } from '@/lib/http';

let mockParams: Record<string, string> = {};

jest.mock('expo-router', () => ({
    router: { canGoBack: () => false, back: jest.fn(), replace: jest.fn(), push: jest.fn(), dismissTo: jest.fn() },
    useLocalSearchParams: () => mockParams,
}));

jest.mock('@/lib/api', () => ({
    ...jest.requireActual('@/lib/api'),
    getCropRecommendation: jest.fn(),
}));

const mockedRecommend = getCropRecommendation as jest.MockedFunction<typeof getCropRecommendation>;

beforeEach(() => {
    mockedRecommend.mockReset();
});

it('koordinat 0 (khatulistiwa) dikirim apa adanya, tidak diganti default', async () => {
    mockParams = { location: 'Pontianak', experience: 'pemula', sunCondition: 'full', latitude: '0', longitude: '109.33' };
    mockedRecommend.mockResolvedValue({ plant: 'tomatoes' });

    render(<PlantRecommendationResultScreen />);

    await waitFor(() => expect(screen.getByText('Tomat')).toBeTruthy());
    expect(mockedRecommend).toHaveBeenCalledWith(expect.objectContaining({ location: { lat: 0, lon: 109.33 } }));
});

it('parameter lokasi yang hilang tidak diam-diam memakai Bandung', async () => {
    mockParams = { experience: 'pemula', sunCondition: 'full' };

    render(<PlantRecommendationResultScreen />);

    expect(await screen.findByText(/lokasi lahan belum dipilih/i)).toBeTruthy();
    expect(mockedRecommend).not.toHaveBeenCalled();
});

it('menampilkan nama Indonesia, misi terkait, dan peringatan untuk pemula', async () => {
    mockParams = { location: 'Bogor', experience: 'pemula', sunCondition: 'partial', latitude: '-6.6', longitude: '106.8' };
    mockedRecommend.mockResolvedValue({ plant: 'vanilla' });

    render(<PlantRecommendationResultScreen />);

    expect(await screen.findByText('Vanili')).toBeTruthy();
    expect(screen.getByText(/cukup menantang untuk pemula/)).toBeTruthy();
    expect(screen.getByText('Lihat Misi yang Tersedia')).toBeTruthy();
    expect(mockedRecommend).toHaveBeenCalledWith(expect.objectContaining({ sun_exposure: 'Partial Shade', tingkat_komitmen: 'beginner' }));
});

it('error server menampilkan pesan dan tombol Coba Lagi', async () => {
    mockParams = { location: 'Bogor', experience: 'mahir', sunCondition: 'full', latitude: '-6.6', longitude: '106.8' };
    mockedRecommend.mockRejectedValue(new RequestError('x', 'timeout'));

    render(<PlantRecommendationResultScreen />);

    expect(await screen.findByText('Rekomendasi Gagal Dimuat')).toBeTruthy();
    expect(screen.getByText(/terlalu lama merespons/)).toBeTruthy();
    expect(screen.getByText('Coba Lagi')).toBeTruthy();
});

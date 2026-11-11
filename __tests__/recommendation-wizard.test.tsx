import { act, fireEvent, render, screen } from '@testing-library/react-native';

import PlantRecommendationScreen from '@/app/plant-recommendation';
import { fetchCurrentWeather } from '@/lib/weather';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    router: { canGoBack: () => true, back: jest.fn(), replace: jest.fn(), push: (...args: unknown[]) => mockPush(...args) },
}));

jest.mock('react-native-webview', () => {
    const React = require('react');
    const { View } = require('react-native');
    const WebView = React.forwardRef((props: object, ref: unknown) => {
        React.useImperativeHandle(ref, () => ({ injectJavaScript: jest.fn() }));
        return React.createElement(View, { testID: 'map', ...props });
    });
    return { WebView };
});

jest.mock('expo-location', () => ({
    getForegroundPermissionsAsync: jest.fn(async () => ({ granted: false })),
    requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
    reverseGeocodeAsync: jest.fn(async () => []),
    geocodeAsync: jest.fn(async () => []),
    getCurrentPositionAsync: jest.fn(),
    Accuracy: { Balanced: 3 },
}));

jest.mock('@/lib/weather', () => ({ fetchCurrentWeather: jest.fn() }));

const mockedWeather = fetchCurrentWeather as jest.MockedFunction<typeof fetchCurrentWeather>;

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(r => (resolve = r));
    return { promise, resolve };
}

function sendMapMessage(data: string) {
    act(() => {
        screen.getByTestId('map').props.onMessage({ nativeEvent: { data } });
    });
}

async function goToLocationStep() {
    render(<PlantRecommendationScreen />);
    fireEvent.press(screen.getByText('Pemula'));
    fireEvent.press(screen.getByRole('button', { name: 'Selanjutnya' }));
    expect(screen.getByText('Di mana lokasi lahanmu?')).toBeTruthy();
}

beforeEach(() => {
    mockPush.mockReset();
    mockedWeather.mockReset();
});

it('tombol lanjut nonaktif sampai titik lahan dipilih; pesan peta yang tidak valid diabaikan', async () => {
    await goToLocationStep();
    expect(screen.getByRole('button', { name: 'Selanjutnya' })).toBeDisabled();

    fireEvent.changeText(screen.getByPlaceholderText('Cari kota / kecamatan...'), 'Bogor');
    expect(screen.getByRole('button', { name: 'Selanjutnya' })).toBeDisabled();

    sendMapMessage('{"latitude":"-6.6","longitude":106.8}');
    sendMapMessage('bukan json');
    sendMapMessage('{"latitude":123,"longitude":106.8}');
    expect(screen.getByRole('button', { name: 'Selanjutnya' })).toBeDisabled();

    mockedWeather.mockResolvedValue({ temp: 25, description: 'Cerah', icon: 'sunny' });
    sendMapMessage('{"latitude":-6.6,"longitude":106.8}');
    await act(async () => {});

    expect(screen.getByRole('button', { name: 'Selanjutnya' })).toBeEnabled();
    expect(screen.getByDisplayValue('Titik peta (-6.6000, 106.8000)')).toBeTruthy();
});

it('respons cuaca untuk titik lama tidak menimpa titik terbaru', async () => {
    await goToLocationStep();
    const first = deferred<Awaited<ReturnType<typeof fetchCurrentWeather>>>();
    const second = deferred<Awaited<ReturnType<typeof fetchCurrentWeather>>>();
    mockedWeather.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    sendMapMessage('{"latitude":-6.6,"longitude":106.8}');
    sendMapMessage('{"latitude":-7.8,"longitude":110.4}');
    await act(async () => {
        second.resolve({ temp: 31, description: 'Cerah', icon: 'sunny' });
    });
    await act(async () => {
        first.resolve({ temp: 19, description: 'Hujan Ringan', icon: 'rainy' });
    });

    expect(screen.getByText('Cuaca saat ini: Cerah, 31°C')).toBeTruthy();
    expect(screen.getByDisplayValue('Titik peta (-7.8000, 110.4000)')).toBeTruthy();
});

it('mengirim koordinat titik yang dipilih ke halaman hasil', async () => {
    await goToLocationStep();
    mockedWeather.mockResolvedValue({ temp: 25, description: 'Cerah', icon: 'sunny' });
    sendMapMessage('{"latitude":0,"longitude":109.33}');
    await act(async () => {});

    fireEvent.press(screen.getByRole('button', { name: 'Selanjutnya' }));
    fireEvent.press(screen.getByText('Sebagian Teduh'));
    fireEvent.press(screen.getByRole('button', { name: 'Lihat Hasil' }));

    expect(mockPush).toHaveBeenCalledWith({
        pathname: '/plant-recommendations-result',
        params: expect.objectContaining({ latitude: '0', longitude: '109.33', experience: 'pemula', sunCondition: 'partial' }),
    });
});

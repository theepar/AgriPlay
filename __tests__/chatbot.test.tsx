import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import ChatbotScreen from '@/app/chatbot';

jest.mock('expo-router', () => ({ router: { canGoBack: () => false, back: jest.fn(), replace: jest.fn() } }));

const OLD_SESSION = {
    id: 'lama',
    title: 'Pertanyaan lama',
    messages: [{ id: 'm1', text: 'Pertanyaan lama', sender: 'user', timestamp: 1 }],
    lastModified: 1,
};

async function flush() {
    await act(async () => {});
}

function send(text: string) {
    fireEvent.changeText(screen.getByPlaceholderText('Ketik pertanyaanmu...'), text);
    fireEvent.press(screen.getByLabelText('Kirim pesan'));
}

beforeEach(async () => {
    jest.useFakeTimers();
    await AsyncStorage.clear();
});

afterEach(() => {
    jest.useRealTimers();
});

it('riwayat lama tidak hilang jika pesan terkirim sebelum riwayat selesai dimuat', async () => {
    await AsyncStorage.setItem('chat_sessions', JSON.stringify([OLD_SESSION]));

    render(<ChatbotScreen />);
    send('halo');
    await flush();

    // Dicek sebelum balasan tiba: skenario app ditutup saat menunggu balasan.
    const saved = JSON.parse((await AsyncStorage.getItem('chat_sessions')) ?? '[]');
    expect(saved.map((s: { id: string }) => s.id)).toContain('lama');
    expect(saved).toHaveLength(2);
});

it('balasan yang tertunda tidak masuk ke topik baru', async () => {
    render(<ChatbotScreen />);
    await flush();

    send('halo');
    fireEvent.press(screen.getByLabelText('Riwayat percakapan'));
    fireEvent.press(screen.getByText('Mulai Topik Baru'));
    await act(async () => {
        jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText(/Halo sobat tani/)).toBeNull();
    expect(screen.getByText('Mulai Diskusi')).toBeTruthy();
});

it('setiap pesan mendapat balasan walau dikirim beruntun', async () => {
    render(<ChatbotScreen />);
    await flush();

    send('halo');
    send('ada hama di daun');
    await act(async () => {
        jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText(/Halo sobat tani/)).toBeTruthy();
    expect(screen.getByText(/pestisida nabati/)).toBeTruthy();
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { EMAIL_PATTERN, SessionProvider, useSession } from '@/lib/session';

jest.mock('expo-router', () => ({ router: { canDismiss: jest.fn(), dismissAll: jest.fn(), replace: jest.fn() } }));

const wrapper = ({ children }: { children: ReactNode }) => <SessionProvider>{children}</SessionProvider>;

async function renderSession() {
    const hook = renderHook(() => useSession(), { wrapper });
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    return hook;
}

beforeEach(async () => {
    await AsyncStorage.clear();
});

describe('EMAIL_PATTERN', () => {
    it.each(['budi@example.com', 'a.b+c@sub.domain.id'])('menerima %s', email => {
        expect(EMAIL_PATTERN.test(email)).toBe(true);
    });

    it.each(['', 'budi', 'budi@', '@example.com', 'budi@example', 'bu di@example.com'])('menolak "%s"', email => {
        expect(EMAIL_PATTERN.test(email)).toBe(false);
    });
});

describe('SessionProvider', () => {
    it('awal: belum onboarding, belum login', async () => {
        const { result } = await renderSession();
        expect(result.current.seenOnboarding).toBe(false);
        expect(result.current.user).toBeNull();
    });

    it('register (dengan nama) lalu sesi bertahan setelah app dibuka ulang', async () => {
        const first = await renderSession();
        await act(() => first.result.current.signIn('siti@example.com', 'Siti Aminah'));
        expect(first.result.current.user).toEqual({ email: 'siti@example.com', name: 'Siti Aminah' });
        first.unmount();

        const second = await renderSession();
        expect(second.result.current.user?.name).toBe('Siti Aminah');
    });

    it('login ulang dengan email yang sama memakai nama yang pernah didaftarkan', async () => {
        const { result } = await renderSession();
        await act(() => result.current.signIn('siti@example.com', 'Siti Aminah'));
        await act(() => result.current.signOut());
        expect(result.current.user).toBeNull();

        await act(() => result.current.signIn('siti@example.com'));
        expect(result.current.user?.name).toBe('Siti Aminah');
    });

    it('login dengan email baru memakai bagian depan email sebagai nama', async () => {
        const { result } = await renderSession();
        await act(() => result.current.signIn('budi.santoso@example.com'));
        expect(result.current.user?.name).toBe('budi.santoso');
    });

    it('tetap bisa login walau profil tersimpan rusak', async () => {
        await AsyncStorage.setItem('session_profile', '{rusak');
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const { result } = await renderSession();

        await act(() => result.current.signIn('budi@example.com'));

        expect(result.current.user).toEqual({ email: 'budi@example.com', name: 'budi' });
        warn.mockRestore();
    });

    it('status onboarding tersimpan', async () => {
        const first = await renderSession();
        await act(() => first.result.current.completeOnboarding());
        first.unmount();

        const second = await renderSession();
        expect(second.result.current.seenOnboarding).toBe(true);
    });
});

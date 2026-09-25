import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, type Href } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

// Sesi lokal sederhana (belum ada backend autentikasi).
const KEYS = {
    onboarding: 'hasSeenOnboarding',
    loggedIn: 'session_logged_in',
    profile: 'session_profile',
} as const;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export interface UserProfile {
    name: string;
    email: string;
}

interface SessionContextValue {
    ready: boolean;
    seenOnboarding: boolean;
    /** Profil pengguna yang sedang login, null jika belum login. */
    user: UserProfile | null;
    completeOnboarding: () => Promise<void>;
    /** Login dengan email. Tanpa `name`, nama diambil dari profil tersimpan jika email-nya sama. */
    signIn: (email: string, name?: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function parseProfile(raw: string | null): UserProfile | null {
    if (!raw) return null;
    try {
        const profile = JSON.parse(raw) as Partial<UserProfile>;
        return typeof profile.email === 'string' && typeof profile.name === 'string'
            ? { email: profile.email, name: profile.name }
            : null;
    } catch {
        console.warn('Profil tersimpan rusak, diabaikan.');
        return null;
    }
}

export function SessionProvider({ children }: { children: ReactNode }) {
    const [ready, setReady] = useState(false);
    const [seenOnboarding, setSeenOnboarding] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        AsyncStorage.multiGet([KEYS.onboarding, KEYS.loggedIn, KEYS.profile])
            .then(([[, onboarding], [, loggedIn], [, profile]]) => {
                setSeenOnboarding(onboarding === 'true');
                if (loggedIn === 'true') setUser(parseProfile(profile));
            })
            .catch(error => console.warn('Gagal memuat sesi:', error))
            .finally(() => setReady(true));
    }, []);

    const completeOnboarding = useCallback(async () => {
        await AsyncStorage.setItem(KEYS.onboarding, 'true');
        setSeenOnboarding(true);
    }, []);

    const signIn = useCallback(async (email: string, name?: string) => {
        const saved = parseProfile(await AsyncStorage.getItem(KEYS.profile));
        const profile: UserProfile = {
            email,
            name: name ?? (saved?.email === email ? saved.name : email.split('@')[0]),
        };
        await AsyncStorage.multiSet([
            [KEYS.profile, JSON.stringify(profile)],
            [KEYS.loggedIn, 'true'],
        ]);
        setUser(profile);
    }, []);

    const signOut = useCallback(async () => {
        await AsyncStorage.removeItem(KEYS.loggedIn);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ ready, seenOnboarding, user, completeOnboarding, signIn, signOut }),
        [ready, seenOnboarding, user, completeOnboarding, signIn, signOut],
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);
    if (!context) throw new Error('useSession harus dipakai di dalam <SessionProvider>');
    return context;
}

/** Kosongkan stack navigasi lalu buka `href` (agar tombol back tidak kembali ke login/onboarding). */
export function resetTo(href: Href) {
    if (router.canDismiss()) router.dismissAll();
    router.replace(href);
}

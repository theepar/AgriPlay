import { ThemedText } from '@/components/themed-text';
import { EMAIL_PATTERN, resetTo, useSession } from '@/lib/session';
import { showAlert } from '@/lib/alert';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    View
} from 'react-native';



export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { user, signIn } = useSession();

    // Pindah ke beranda setelah sesi tersimpan (state sudah ter-update).
    useEffect(() => {
        if (user) resetTo('/');
    }, [user]);

    const handleLogin = async () => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!EMAIL_PATTERN.test(trimmedEmail)) {
            setError('Masukkan alamat email yang valid.');
            return;
        }
        if (!password) {
            setError('Password wajib diisi.');
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            await signIn(trimmedEmail);
        } catch {
            setError('Gagal masuk. Coba lagi.');
            setSubmitting(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        showAlert('Segera Hadir', `Login dengan ${provider} belum tersedia. Silakan masuk dengan email.`);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Decorative Background Element */}
            <View style={styles.decorativeCircle} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(60, insets.top + 24) }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* 1. Header & Logo */}
                    <View style={styles.headerSection}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoPlaceholder}>
                                <Ionicons name="leaf" size={40} color="#047857" />
                            </View>
                        </View>
                        <ThemedText type="title" style={styles.title}>Selamat Datang!</ThemedText>
                        <ThemedText style={styles.subtitle}>Masuk untuk mulai merawat tanamanmu.</ThemedText>
                    </View>

                    {/* 2. Form Section */}
                    <View style={styles.formSection}>
                        {/* Email */}
                        <View style={styles.inputWrapper}>
                            <ThemedText type="defaultSemiBold" style={styles.label}>Email Address</ThemedText>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="nama@email.com"
                                    placeholderTextColor="#D1D5DB"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                />
                            </View>
                        </View>

                        {/* Password */}
                        <View style={styles.inputWrapper}>
                            <ThemedText type="defaultSemiBold" style={styles.label}>Password</ThemedText>
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Masukkan password"
                                    placeholderTextColor="#D1D5DB"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoComplete="password"
                                    textContentType="password"
                                    onSubmitEditing={handleLogin}
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} hitSlop={8} accessibilityRole="button" accessibilityLabel={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                                </Pressable>
                            </View>
                            <Pressable
                                style={{ alignSelf: 'flex-end', marginTop: 8 }}
                                hitSlop={12}
                                accessibilityRole="button"
                                onPress={() => showAlert('Segera Hadir', 'Reset password belum tersedia karena akun masih tersimpan di perangkat ini.')}
                            >
                                <ThemedText style={styles.forgotPassword}>Lupa Password?</ThemedText>
                            </Pressable>
                        </View>

                        {error && (
                            <View style={styles.errorBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
                                <Ionicons name="alert-circle" size={18} color="#DC2626" />
                                <ThemedText style={styles.errorText}>{error}</ThemedText>
                            </View>
                        )}

                        {/* Login Button */}
                        <Pressable accessibilityLabel="Masuk" accessibilityRole="button" accessibilityState={{ disabled: submitting }}
                            style={[styles.loginButton, submitting && { opacity: 0.7 }]}
                            onPress={handleLogin}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <ThemedText style={styles.loginButtonText}>Masuk</ThemedText>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                                </>
                            )}
                        </Pressable>
                    </View>

                    {/* 3. Social Login */}
                    <View style={styles.socialSection}>
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <ThemedText style={styles.dividerText}>Atau lanjutkan dengan</ThemedText>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialRow}>
                            <Pressable style={styles.socialBtn} onPress={() => handleSocialLogin('Google')} accessibilityRole="button" accessibilityLabel="Masuk dengan Google">
                                <Ionicons name="logo-google" size={24} color="#DB4437" />
                            </Pressable>
                            <Pressable style={styles.socialBtn} onPress={() => handleSocialLogin('Apple')} accessibilityRole="button" accessibilityLabel="Masuk dengan Apple">
                                <Ionicons name="logo-apple" size={24} color="#000" />
                            </Pressable>
                            <Pressable style={styles.socialBtn} onPress={() => handleSocialLogin('Facebook')} accessibilityRole="button" accessibilityLabel="Masuk dengan Facebook">
                                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                            </Pressable>
                        </View>
                    </View>

                    {/* 4. Register Link */}
                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>Belum punya akun? </ThemedText>
                        <Pressable accessibilityRole="button" hitSlop={12} onPress={() => router.push('/register')}>
                            <ThemedText style={styles.registerLink}>Daftar Sekarang</ThemedText>
                        </Pressable>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    decorativeCircle: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#ECFDF5', // Very light green
        zIndex: -1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
        justifyContent: 'center',
    },

    // HEADER
    headerSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        // Rotate sedikit agar dinamis
        transform: [{ rotate: '-10deg' }]
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
    },

    // FORM
    formSection: {
        marginBottom: 32,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        height: 56,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        height: '100%',
    },
    eyeIcon: {
        padding: 8,
    },
    forgotPassword: {
        fontSize: 13,
        color: '#047857',
        fontWeight: '600',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 12,
        marginBottom: 4,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: '#B91C1C',
    },
    loginButton: {
        backgroundColor: '#047857', // Emerald Primary
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        gap: 8,
        shadowColor: '#047857',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // SOCIAL
    socialSection: {
        marginBottom: 40,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 13,
        color: '#6B7280',
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialBtn: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // FOOTER
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#6B7280',
    },
    registerLink: {
        fontSize: 14,
        color: '#047857',
        fontWeight: 'bold',
    },
});
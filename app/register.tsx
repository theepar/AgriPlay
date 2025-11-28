import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = () => {
        if (password !== confirmPassword) {
            alert('Password tidak cocok!');
            return;
        }
        console.log('Register:', { username, email, password });
        router.replace('/login');
    };

    const handleSocialLogin = (provider: string) => {
        console.log('Social login with:', provider);
        router.replace('/');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Decorative Background Element (Inverted position from login) */}
            <View style={styles.decorativeCircle} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* 1. Header */}
                    <View style={styles.headerSection}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoPlaceholder}>
                                <Ionicons name="person-add" size={32} color="#059669" />
                            </View>
                        </View>
                        <ThemedText type="title" style={styles.title}>Buat Akun Baru</ThemedText>
                        <ThemedText style={styles.subtitle}>Bergabunglah dengan komunitas petani modern.</ThemedText>
                    </View>

                    {/* 2. Form Section */}
                    <View style={styles.formSection}>

                        {/* Username */}
                        <View style={styles.inputWrapper}>
                            <ThemedText type="defaultSemiBold" style={styles.label}>Username</ThemedText>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Pilih username"
                                    placeholderTextColor="#D1D5DB"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

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
                                    placeholder="Minimal 8 karakter"
                                    placeholderTextColor="#D1D5DB"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                                </Pressable>
                            </View>
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputWrapper}>
                            <ThemedText type="defaultSemiBold" style={styles.label}>Konfirmasi Password</ThemedText>
                            <View style={styles.inputContainer}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ulangi password"
                                    placeholderTextColor="#D1D5DB"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                                    <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9CA3AF" />
                                </Pressable>
                            </View>
                        </View>

                        {/* Register Button */}
                        <Pressable
                            style={styles.registerButton}
                            onPress={handleRegister}
                        >
                            <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </Pressable>
                    </View>

                    {/* 3. Social Login */}
                    <View style={styles.socialSection}>
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <ThemedText style={styles.dividerText}>Atau daftar dengan</ThemedText>
                            <View style={styles.divider} />
                        </View>

                        <View style={styles.socialRow}>
                            <Pressable style={styles.socialBtn} onPress={() => handleSocialLogin('google')}>
                                <Ionicons name="logo-google" size={24} color="#DB4437" />
                            </Pressable>
                            <Pressable style={styles.socialBtn} onPress={() => handleSocialLogin('apple')}>
                                <Ionicons name="logo-apple" size={24} color="#000" />
                            </Pressable>
                            <Pressable style={styles.socialBtn} onPress={() => handleSocialLogin('facebook')}>
                                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                            </Pressable>
                        </View>
                    </View>

                    {/* 4. Login Link */}
                    <View style={styles.footer}>
                        <ThemedText style={styles.footerText}>Sudah punya akun? </ThemedText>
                        <Pressable onPress={() => router.replace('/login')}>
                            <ThemedText style={styles.loginLink}>Masuk di sini</ThemedText>
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
    },
    decorativeCircle: {
        position: 'absolute',
        top: -80,
        left: -80, // Pindah ke kiri untuk variasi
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
    },

    // HEADER
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        marginBottom: 20,
    },
    logoPlaceholder: {
        width: 70,
        height: 70,
        borderRadius: 20,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '5deg' }]
    },
    title: {
        fontSize: 26,
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
        marginBottom: 16,
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
    registerButton: {
        backgroundColor: '#059669', // Emerald Primary
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
        gap: 8,
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
    },
    registerButtonText: {
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
        color: '#9CA3AF',
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
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#6B7280',
    },
    loginLink: {
        fontSize: 14,
        color: '#059669',
        fontWeight: 'bold',
    },
});
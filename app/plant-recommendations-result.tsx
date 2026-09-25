import { ThemedText } from '@/components/themed-text';
import { getCropInfo, type CropInfo } from '@/constants/crops';
import { describeApiError, getCropRecommendation, mapExperienceToAPI, mapSunConditionToAPI } from '@/lib/api';
import { goBack } from '@/lib/navigation';
import { showAlert } from '@/lib/alert';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

// --- CONSTANTS ---
const PADDING = 24;

function parseCoordinate(value: string | undefined, limit: number): number | null {
    const parsed = Number(value);
    return value && Number.isFinite(parsed) && Math.abs(parsed) <= limit ? parsed : null;
}

type ResultState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; crop: CropInfo };

export default function PlantRecommendationResultScreen() {
    const params = useLocalSearchParams<{
        location?: string;
        experience?: string;
        sunCondition?: string;
        latitude?: string;
        longitude?: string;
    }>();
    const location = params.location || 'Lokasi Tidak Diketahui';
    const experience = params.experience || 'pemula';
    const sunCondition = params.sunCondition || 'full';
    const latitude = parseCoordinate(params.latitude, 90);
    const longitude = parseCoordinate(params.longitude, 180);
    const hasLocation = latitude !== null && longitude !== null;

    const [result, setResult] = useState<ResultState>(
        hasLocation ? { status: 'loading' } : { status: 'error', message: 'Lokasi lahan belum dipilih. Ulangi langkah rekomendasi.' },
    );
    const [attempt, setAttempt] = useState(0);

    // Call ML API on mount (dan setiap kali pengguna menekan "Coba Lagi")
    useEffect(() => {
        if (latitude === null || longitude === null) return;
        let cancelled = false;
        getCropRecommendation({
            tingkat_komitmen: mapExperienceToAPI(experience),
            location: { lat: latitude, lon: longitude },
            sun_exposure: mapSunConditionToAPI(sunCondition),
            area: 20,
        })
            .then(response => {
                if (!cancelled) setResult({ status: 'success', crop: getCropInfo(response.plant) });
            })
            .catch(error => {
                if (!cancelled) setResult({ status: 'error', message: describeApiError(error) });
            });
        return () => {
            cancelled = true;
        };
    }, [experience, sunCondition, latitude, longitude, attempt]);

    const handleRetry = () => {
        setResult({ status: 'loading' });
        setAttempt(n => n + 1);
    };

    const handleShare = async () => {
        if (result.status !== 'success') return;
        const { crop } = result;
        try {
            await Share.share({
                message:
                    `🌱 Rekomendasi Tanaman untuk Saya!\n\n` +
                    `✨ ${crop.name} (lokasi: ${location})\n` +
                    `⏱️ Waktu Tumbuh: ${crop.growthTime}\n` +
                    `📊 Tingkat Kesulitan: ${crop.difficulty}\n\n` +
                    `📝 ${crop.description}\n\n` +
                    `Dapatkan rekomendasi tanaman kamu di Agrarian! 🌿`,
                title: `Rekomendasi Tanaman: ${crop.name}`,
            });
        } catch {
            showAlert('Error', 'Gagal membagikan rekomendasi');
        }
    };

    const experienceLabel = experience.charAt(0).toUpperCase() + experience.slice(1);
    const missionPlantId = result.status === 'success' ? result.crop.plantId : undefined;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => goBack('/plant-recommendation')} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Kembali">
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Hasil Analisis</ThemedText>
                <TouchableOpacity
                    onPress={handleShare}
                    disabled={result.status !== 'success'}
                    style={styles.headerBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Bagikan rekomendasi"
                >
                    <Ionicons name="share-social-outline" size={24} color={result.status === 'success' ? '#111827' : '#D1D5DB'} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* LOADING STATE */}
                {result.status === 'loading' && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#059669" />
                        <ThemedText style={styles.loadingText}>Menganalisis data iklim lokasi...</ThemedText>
                        <ThemedText style={styles.loadingHint}>
                            Proses pertama bisa memakan waktu hingga 1 menit.
                        </ThemedText>
                    </View>
                )}

                {/* ERROR STATE */}
                {result.status === 'error' && (
                    <View style={styles.errorCard}>
                        <View style={styles.errorIconBg}>
                            <Ionicons name="cloud-offline-outline" size={32} color="#B45309" />
                        </View>
                        <ThemedText type="subtitle" style={styles.errorTitle}>Rekomendasi Gagal Dimuat</ThemedText>
                        <ThemedText style={styles.errorText}>{result.message}</ThemedText>
                        {hasLocation ? (
                            <TouchableOpacity style={styles.homeButton} onPress={handleRetry}>
                                <Ionicons name="refresh" size={20} color="#FFF" />
                                <ThemedText style={styles.homeButtonText}>Coba Lagi</ThemedText>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/plant-recommendation')}>
                                <Ionicons name="location-outline" size={20} color="#FFF" />
                                <ThemedText style={styles.homeButtonText}>Pilih Lokasi</ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* CONTENT */}
                {result.status === 'success' && (
                    <>
                        {/* TITLE BLOCK */}
                        <View style={styles.titleBlock}>
                            <ThemedText type="title" style={styles.titleMain}>Rekomendasi Utama</ThemedText>
                            <ThemedText style={styles.titleSub}>
                                Berdasarkan iklim <ThemedText style={styles.highlight}>{location}</ThemedText> & level <ThemedText style={styles.highlight}>{experienceLabel}</ThemedText>.
                            </ThemedText>
                        </View>

                        {/* HERO CARD */}
                        <View style={styles.heroCard}>
                            <View style={styles.heroHeader}>
                                <ThemedText type="title" style={styles.heroTitle}>{result.crop.name}</ThemedText>
                                <View style={styles.aiBadge}>
                                    <Ionicons name="sparkles" size={12} color="#FFF" />
                                    <ThemedText style={styles.aiBadgeText}>AI</ThemedText>
                                </View>
                            </View>

                            <View style={styles.heroContent}>
                                <View style={styles.heroTags}>
                                    <View style={styles.tag}>
                                        <Ionicons name="time-outline" size={12} color="#6B7280" />
                                        <ThemedText style={styles.tagText}>{result.crop.growthTime}</ThemedText>
                                    </View>
                                    <View style={styles.dot} />
                                    <View style={styles.tag}>
                                        <Ionicons name="bar-chart-outline" size={12} color="#6B7280" />
                                        <ThemedText style={styles.tagText}>{result.crop.difficulty}</ThemedText>
                                    </View>
                                </View>

                                <ThemedText style={styles.heroDesc}>{result.crop.description}</ThemedText>

                                {experience === 'pemula' && result.crop.difficulty === 'Sulit' && (
                                    <View style={styles.warningBox}>
                                        <Ionicons name="alert-circle-outline" size={18} color="#B45309" />
                                        <ThemedText style={styles.warningText}>
                                            Tanaman ini cocok dengan iklim lokasimu, tetapi cukup menantang untuk pemula dan butuh waktu lama hingga panen.
                                        </ThemedText>
                                    </View>
                                )}

                                <ThemedText style={styles.sourceNote}>
                                    Diprediksi model AI dari rata-rata suhu, curah hujan, kelembapan, radiasi matahari (NASA POWER) dan ketinggian lokasi.
                                </ThemedText>
                            </View>
                        </View>

                        {/* Start Planting Button */}
                        {missionPlantId ? (
                            <TouchableOpacity
                                style={styles.startPlantingButton}
                                onPress={() => router.push({ pathname: '/missions/[id]', params: { id: missionPlantId } })}
                            >
                                <Ionicons name="leaf-outline" size={20} color="#059669" />
                                <ThemedText style={styles.startPlantingButtonText}>Mulai Misi Tanaman Ini</ThemedText>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.startPlantingButton} onPress={() => router.push('/missions')}>
                                <Ionicons name="trophy-outline" size={20} color="#059669" />
                                <ThemedText style={styles.startPlantingButtonText}>Lihat Misi yang Tersedia</ThemedText>
                            </TouchableOpacity>
                        )}

                        {/* Back to Home Button */}
                        <TouchableOpacity
                            style={styles.homeButton}
                            onPress={() => router.dismissTo('/')}
                        >
                            <Ionicons name="home-outline" size={20} color="#FFF" />
                            <ThemedText style={styles.homeButtonText}>Kembali ke Beranda</ThemedText>
                        </TouchableOpacity>
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Off-white modern bg
    },
    scrollContent: {
        paddingHorizontal: PADDING,
        paddingBottom: 40,
    },

    // HEADER
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: PADDING,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        backgroundColor: '#F9FAFB',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    headerBtn: {
        width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16, fontWeight: '700', color: '#111827',
    },

    // TITLES
    titleBlock: {
        marginTop: 24,
        marginBottom: 24,
    },
    titleMain: {
        fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 6,
    },
    titleSub: {
        fontSize: 15, color: '#6B7280', lineHeight: 22,
    },
    highlight: {
        fontWeight: '700', color: '#059669',
    },

    // HERO CARD
    heroCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 32,
        shadowColor: '#059669', // Shadow warna hijau tipis
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1, borderColor: '#F3F4F6',
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        paddingBottom: 0,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        flex: 1,
        marginRight: 12,
    },
    aiBadge: {
        backgroundColor: '#059669',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    aiBadgeText: {
        color: '#FFF', fontSize: 12, fontWeight: '700',
    },
    heroContent: {
        padding: 20,
        gap: 12,
    },
    heroTags: {
        flexDirection: 'row', alignItems: 'center',
    },
    tag: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    tagText: {
        fontSize: 13, color: '#6B7280', fontWeight: '500',
    },
    dot: {
        width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginHorizontal: 8,
    },
    heroDesc: {
        fontSize: 14, color: '#4B5563', lineHeight: 22,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFBEB',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    warningText: {
        flex: 1, fontSize: 13, color: '#92400E', lineHeight: 19,
    },
    sourceNote: {
        fontSize: 12, color: '#9CA3AF', lineHeight: 18,
    },

    // LOADING & ERROR
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    loadingHint: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    errorCard: {
        marginTop: 32,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    errorIconBg: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: '#FEF3C7',
        alignItems: 'center', justifyContent: 'center',
    },
    errorTitle: {
        fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center',
    },
    errorText: {
        fontSize: 14, color: '#6B7280', lineHeight: 21, textAlign: 'center', marginBottom: 8,
    },

    // BUTTONS
    homeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        backgroundColor: '#059669',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 10,
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
    startPlantingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ECFDF5',
        borderWidth: 2,
        borderColor: '#059669',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        gap: 10,
        marginBottom: 12,
    },
    startPlantingButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#059669',
    },
});

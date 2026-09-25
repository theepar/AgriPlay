import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { PLANTS_DATA } from '@/constants/plants';
import { getPlantProgress, useGarden } from '@/lib/garden-store';
import { useSession } from '@/lib/session';
import { fetchCurrentWeather, type CurrentWeather } from '@/lib/weather';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Redirect, router } from 'expo-router';
import { useEffect, useState, type ComponentProps } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface WeatherData extends CurrentWeather {
    location: string;
}

const FALLBACK_WEATHER: WeatherData = {
    temp: 27,
    description: 'Cerah Berawan',
    icon: 'partly-sunny',
    location: 'Bandung',
};

// Rute "/" menjadi gerbang: arahkan ke onboarding/login jika belum login.
export default function IndexRoute() {
    const { user, seenOnboarding } = useSession();
    if (!user) {
        return <Redirect href={seenOnboarding ? '/login' : '/onboarding'} />;
    }
    return <HomeScreen userName={user.name} />;
}

function HomeScreen({ userName }: { userName: string }) {
    const { taskStatus } = useGarden();
    const myPlants = PLANTS_DATA.slice(0, 3).map(plant => {
        const { percent, activeTask } = getPlantProgress(plant, taskStatus);
        return {
            id: plant.id,
            name: plant.name,
            nextStep: activeTask ? `Berikutnya: ${activeTask.title}` : 'Semua misi selesai 🎉',
            progress: percent,
            reminder: percent < 50,
            color: plant.color,
            image: plant.image,
        };
    });

    // Weather state
    const [weather, setWeather] = useState<WeatherData>(FALLBACK_WEATHER);
    const [loadingWeather, setLoadingWeather] = useState(true);

    // Fetch weather data
    useEffect(() => {
        fetchWeatherData();
    }, []);

    const fetchWeatherData = async () => {
        try {
            // 1. Get location permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            // 2. Get current location with LOW accuracy for speed
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Low, // Much faster (~1-2 sec vs 10+ sec)
            });
            const { latitude, longitude } = location.coords;

            // 3. Fetch location name & weather in PARALLEL for speed
            const [addressResult, weatherResult] = await Promise.allSettled([
                Location.reverseGeocodeAsync({ latitude, longitude }),
                fetchCurrentWeather(latitude, longitude),
            ]);

            let locationName = 'Lokasi Tidak Diketahui';
            if (addressResult.status === 'fulfilled' && addressResult.value[0]) {
                locationName = addressResult.value[0].city || addressResult.value[0].subregion || locationName;
            }

            const current = weatherResult.status === 'fulfilled' ? weatherResult.value : FALLBACK_WEATHER;
            setWeather({ ...current, location: locationName });
        } catch (error) {
            console.warn('Weather fetch error:', error);
        } finally {
            setLoadingWeather(false);
        }
    };

    const handlePlantDetail = (plantId: string) => {
        router.push({ pathname: '/missions/[id]', params: { id: plantId } });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={styles.fixedHeaderContainer}>
                <LinearGradient
                    colors={['#064E3B', '#059669', '#10B981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fixedHeaderBackground}
                />

                {/* Dekorasi lingkaran transparan */}
                <View style={styles.heroAccentCircle} />

                <View style={styles.headerContentWrapper}>
                    <View style={styles.header}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                            <ThemedText style={styles.greeting} numberOfLines={1}>Halo, {userName}! 🌱</ThemedText>
                            <ThemedText style={styles.subGreeting}>Siap merawat tanamanmu hari ini?</ThemedText>
                        </View>
                        <Pressable style={styles.profileBtn} onPress={() => router.push('/profile')}>
                            <Avatar name={userName} size={44} />
                        </Pressable>
                    </View>

                    {/* 2. Weather Card (Sekarang di dalam fixed container) */}
                    <View style={styles.weatherCard}>
                        {loadingWeather ? (
                            <ActivityIndicator size="large" color="#059669" />
                        ) : (
                            <>
                                <View>
                                    <ThemedText style={styles.weatherTemp}>{weather.temp}°</ThemedText>
                                    <ThemedText style={styles.weatherDesc}>{weather.description} • {weather.location}</ThemedText>
                                </View>
                                <Ionicons name={weather.icon} size={56} color="#F59E0B" />
                            </>
                        )}
                    </View>
                </View>
            </View>

            {/* --- BAGIAN 2: SCROLLABLE CONTENT --- */}
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                {/* 3. Active Plants Section */}
                <View style={[styles.sectionHeader, styles.containerPadding]}>
                    <ThemedText style={styles.sectionTitle}>Kebun Saya</ThemedText>
                    <Pressable onPress={() => router.push('/virtual-garden')}>
                        <ThemedText style={styles.seeAll}>Lihat Semua</ThemedText>
                    </Pressable>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.plantsScroll}
                >
                    {myPlants.map((plant) => (
                        <Pressable
                            key={plant.id}
                            style={styles.plantCard}
                            onPress={() => handlePlantDetail(plant.id)}
                        >
                            <View style={styles.imageWrapper}>
                                <Image source={{ uri: plant.image }} style={styles.plantImage} contentFit="cover" />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                                    style={styles.imageOverlay}
                                />
                                {plant.reminder && (
                                    <View style={styles.reminderBadge}>
                                        <Ionicons name="water" size={10} color="#fff" />
                                        <ThemedText style={styles.reminderText}>Siram</ThemedText>
                                    </View>
                                )}
                            </View>

                            <View style={styles.plantInfo}>
                                <ThemedText style={styles.plantName}>{plant.name}</ThemedText>
                                <ThemedText style={styles.plantDate} numberOfLines={1}>{plant.nextStep}</ThemedText>
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressTrack}>
                                        <View style={[styles.progressFill, { width: `${plant.progress}%`, backgroundColor: plant.color }]} />
                                    </View>
                                    <ThemedText style={styles.progressText}>{plant.progress}%</ThemedText>
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* 4. Main Menu Grid */}
                <ThemedText style={[styles.sectionTitle, styles.containerPadding, { marginTop: 24, marginBottom: 16 }]}>Fitur Utama</ThemedText>

                <View style={[styles.menuGrid, styles.containerPadding]}>
                    <MenuCard title="Rekomendasi" subtitle="Cek Tanaman" icon="leaf" color="#059669" onPress={() => router.push('/plant-recommendation')} />
                    <MenuCard title="Misi Harian" subtitle="Dapat XP" icon="trophy" color="#DC2626" onPress={() => router.push('/missions')} />
                    <MenuCard title="Virtual Garden" subtitle="Koleksi" icon="flower" color="#D97706" onPress={() => router.push('/virtual-garden')} fullWidth />
                    {/* <MenuCard title="Agra AI" subtitle="Tanya Jawab" icon="chatbubbles" color="#2563EB" onPress={() => router.push('/chatbot')} /> */}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// Helper Component for Menu Grid
interface MenuCardProps {
    title: string;
    subtitle: string;
    icon: ComponentProps<typeof Ionicons>['name'];
    color: string;
    onPress: () => void;
    fullWidth?: boolean;
}

const MenuCard = ({ title, subtitle, icon, color, onPress, fullWidth }: MenuCardProps) => (
    <Pressable style={[styles.menuCard, fullWidth && styles.menuCardFullWidth]} onPress={onPress}>
        <View style={[styles.menuIconBg, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <View>
            <ThemedText style={styles.menuTitle}>{title}</ThemedText>
            <ThemedText style={styles.menuSubtitle}>{subtitle}</ThemedText>
        </View>
        <View style={styles.arrowBg}>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
    </Pressable>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },

    // --- 1. FIXED HEADER STYLES ---
    fixedHeaderContainer: {
        // Tidak perlu height fix, biarkan konten yang menentukan tingginya
        // Border radius hanya di bawah untuk efek curve
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden', // Penting agar gradient mengikuti border radius

        // Shadow agar terlihat melayang di atas scroll view
        zIndex: 10,
        backgroundColor: '#fff', // Fallback color
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        paddingBottom: 24, // Memberi ruang di bawah weather card sebelum batas curve
    },
    fixedHeaderBackground: {
        ...StyleSheet.absoluteFillObject, // Gradient memenuhi container fixed
    },
    headerContentWrapper: {
        paddingTop: Platform.OS === 'ios' ? 60 : 50, // Mengatasi status bar
        paddingHorizontal: 24,
    },
    heroAccentCircle: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },

    // Header Text & Profile
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    subGreeting: {
        fontSize: 14,
        color: '#D1FAE5',
        marginTop: 4,
        fontWeight: '500',
    },
    profileBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        overflow: 'hidden',
    },

    // Weather Card (Inside Fixed Area)
    weatherCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderRadius: 24,
        minHeight: 100, // Tambah min height agar tidak terpotong

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    weatherTemp: {
        fontSize: 40,
        fontWeight: '800',
        color: '#111827',
        lineHeight: 48, // Tambah line height agar tidak terpotong
        includeFontPadding: false, // Android: hilangkan padding tambahan
    },
    weatherDesc: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
        fontWeight: '500',
    },

    // --- 2. SCROLLABLE CONTENT STYLES ---
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 24,
        paddingBottom: 24,
    },
    containerPadding: {
        paddingHorizontal: 24,
    },

    // Section Titles
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
    },

    // Plant Cards
    plantsScroll: {
        gap: 16,
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    plantCard: {
        width: width * 0.6,
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    imageWrapper: {
        height: 130,
        width: '100%',
        position: 'relative',
    },
    plantImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    reminderBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
        borderWidth: 1,
        borderColor: '#ffffff50',
    },
    reminderText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    plantInfo: {
        padding: 16,
    },
    plantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    plantDate: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressTrack: {
        flex: 1,
        height: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },

    // Menu Grid
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    menuCard: {
        width: (width - 48 - 12) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        minHeight: 130,
        justifyContent: 'flex-start',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    menuCardFullWidth: {
        width: '100%',
    },
    menuIconBg: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
        lineHeight: 20,
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        lineHeight: 16,
    },
    arrowBg: {
        position: 'absolute',
        top: 18,
        right: 18,
        opacity: 0.4,
    },
});
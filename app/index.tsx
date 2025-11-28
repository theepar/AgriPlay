import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Data Baru dengan GAMBAR ASLI (Unsplash)
const DUMMY_PLANTS = [
    {
        id: 1,
        name: 'Kentang Granola',
        startDate: '9 Okt 2025',
        progress: 65,
        reminder: true,
        color: '#059669',
        image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 2,
        name: 'Tomat Cherry',
        startDate: '15 Okt 2025',
        progress: 45,
        reminder: true,
        color: '#EA580C',
        image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=400&auto=format&fit=crop',
    },
    {
        id: 3,
        name: 'Cabai Rawit',
        startDate: '20 Okt 2025',
        progress: 30,
        reminder: false,
        color: '#DC2626',
        image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=400&auto=format&fit=crop',
    },
];

export default function HomeScreen() {
    const [myPlants, setMyPlants] = useState(DUMMY_PLANTS);
    const [weather, setWeather] = useState({
        temp: '--',
        desc: 'Memuat cuaca...',
        city: 'Mencari lokasi...',
        icon: 'cloud-outline' as any
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setWeather(prev => ({ ...prev, desc: 'Izin lokasi ditolak', city: '-' }));
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;

                // Get City Name
                let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
                let city = reverseGeocode[0]?.city || reverseGeocode[0]?.district || reverseGeocode[0]?.subregion || 'Lokasi Saya';

                // Get Weather
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
                );
                const data = await response.json();
                const current = data.current_weather;

                const { desc, icon } = getWeatherInfo(current.weathercode);

                setWeather({
                    temp: `${Math.round(current.temperature)}°C`,
                    desc: desc,
                    city: city,
                    icon: icon
                });
            } catch (error) {
                console.log('Weather Error:', error);
                setWeather(prev => ({ ...prev, desc: 'Gagal memuat cuaca', temp: '--' }));
            }
        })();
    }, []);

    const getWeatherInfo = (code: number) => {
        if (code === 0) return { desc: 'Cerah', icon: 'sunny' };
        if (code >= 1 && code <= 3) return { desc: 'Berawan', icon: 'partly-sunny' };
        if (code >= 45 && code <= 48) return { desc: 'Berkabut', icon: 'cloudy' };
        if (code >= 51 && code <= 67) return { desc: 'Hujan Ringan', icon: 'rainy' };
        if (code >= 80 && code <= 82) return { desc: 'Hujan Deras', icon: 'thunderstorm' };
        if (code >= 95 && code <= 99) return { desc: 'Badai Petir', icon: 'thunderstorm' };
        return { desc: 'Cerah', icon: 'sunny' };
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('hasSeenOnboarding');
        router.replace('/onboarding');
    };

    const handlePlantDetail = (plantId: number) => {
        router.push({ pathname: '/missions/[id]', params: { id: plantId.toString() } });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. Header Section */}
                <View style={styles.header}>
                    <View>
                        <ThemedText type="title" style={styles.greeting}>Halo, Petani! 👋</ThemedText>
                        <ThemedText style={styles.subGreeting}>Mari cek kebunmu hari ini.</ThemedText>
                    </View>
                    <Pressable style={styles.profileBtn} onPress={() => router.push('/profile')}>
                        <Ionicons name="person" size={20} color="#059669" />
                    </Pressable>
                </View>

                {/* 2. Weather Widget */}
                <View style={styles.weatherCard}>
                    <View>
                        <ThemedText style={styles.weatherTemp}>{weather.temp}</ThemedText>
                        <ThemedText style={styles.weatherDesc}>{weather.desc} • {weather.city}</ThemedText>
                    </View>
                    <Ionicons name={weather.icon} size={48} color="#F59E0B" />
                </View>

                {/* 3. Active Plants Section (UPDATED) */}
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Kebun Saya</ThemedText>
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
                            {/* Image Area */}
                            <View style={styles.imageWrapper}>
                                <Image source={{ uri: plant.image }} style={styles.plantImage} contentFit="cover" />

                                {/* Overlay Gradient (Optional for text legibility if needed, but here we use clean card) */}

                                {/* Reminder Badge Overlay */}
                                {plant.reminder && (
                                    <View style={styles.reminderBadge}>
                                        <Ionicons name="water" size={10} color="#fff" />
                                        <ThemedText style={styles.reminderText}>Siram</ThemedText>
                                    </View>
                                )}
                            </View>

                            {/* Info Area */}
                            <View style={styles.plantInfo}>
                                <ThemedText type="defaultSemiBold" style={styles.plantName}>{plant.name}</ThemedText>
                                <ThemedText style={styles.plantDate}>Mulai: {plant.startDate}</ThemedText>

                                {/* Progress Bar */}
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
                <ThemedText type="subtitle" style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>Fitur Utama</ThemedText>

                <View style={styles.menuGrid}>
                    <MenuCard
                        title="Rekomendasi"
                        subtitle="Cek Tanaman"
                        icon="leaf"
                        color="#059669"
                        onPress={() => router.push('/plant-recommendation')}
                    />
                    <MenuCard
                        title="Misi Harian"
                        subtitle="Dapat XP"
                        icon="trophy"
                        color="#DC2626"
                        onPress={() => router.push('/missions')}
                    />
                    <MenuCard
                        title="Virtual Garden"
                        subtitle="Koleksi"
                        icon="flower"
                        color="#D97706"
                        onPress={() => router.push('/virtual-garden')}
                    />
                    <MenuCard
                        title="Agri AI"
                        subtitle="Tanya Jawab"
                        icon="chatbubbles"
                        color="#2563EB"
                        onPress={() => router.push('/chatbot')}
                    />
                </View>

                {/* Debug Logout */}
                <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                    <ThemedText style={styles.logoutText}>Log Out (Dev)</ThemedText>
                </Pressable>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// Helper Component for Menu Grid
const MenuCard = ({ title, subtitle, icon, color, onPress }: any) => (
    <Pressable style={styles.menuCard} onPress={onPress}>
        <View style={[styles.menuIconBg, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <View>
            <ThemedText type="defaultSemiBold" style={styles.menuTitle}>{title}</ThemedText>
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
    scrollContent: {
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
    },
    subGreeting: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    profileBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    // Weather Card
    weatherCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    weatherTemp: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
    },
    weatherDesc: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
        fontWeight: '500',
    },

    // Section
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

    // ACTIVE PLANTS (Updated Styles)
    plantsScroll: {
        gap: 16,
        paddingRight: 24,
    },
    plantCard: {
        width: width * 0.7, // Lebar kartu
        backgroundColor: '#fff',
        borderRadius: 20,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 1,
        overflow: 'hidden', // Agar gambar tidak keluar radius
    },
    imageWrapper: {
        height: 80, // Tinggi area gambar
        width: '100%',
        position: 'relative',
    },
    plantImage: {
        width: '100%',
        height: '100%',
    },
    reminderBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EF4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    reminderText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    plantInfo: {
        padding: 12,
    },
    plantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    plantDate: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 12,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
        gap: 16,
    },
    menuCard: {
        width: (width - 48 - 16) / 2,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        position: 'relative',
        height: 140,
        justifyContent: 'space-between',
    },
    menuIconBg: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    arrowBg: {
        position: 'absolute',
        top: 16,
        right: 16,
    },

    // Logout
    logoutBtn: {
        marginTop: 40,
        alignSelf: 'center',
        padding: 10,
    },
    logoutText: {
        fontSize: 13,
        color: '#D1D5DB',
    },
});
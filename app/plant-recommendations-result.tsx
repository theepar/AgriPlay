import { ThemedText } from '@/components/themed-text';
import { PLANTS_DATA } from '@/constants/plants';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// --- CONSTANTS ---
const GAP = 16;
const PADDING = 24;
const COLUMN_WIDTH = (width - (PADDING * 2) - GAP) / 2;

// Default mapping from local plant data
const RECOMMENDED_PLANTS = PLANTS_DATA.map((plant, index) => ({
    id: Number(plant.id),
    name: plant.name,
    difficulty: plant.difficulty,
    growthTime: plant.growthTime,
    matchScore: [98, 85, 82, 78, 92][index] || 80,
    description: plant.description,
    image: plant.image,
    color: plant.color,
}));

// Plant name mapping for ML API results
const PLANT_NAME_MAP: Record<string, typeof RECOMMENDED_PLANTS[0] | undefined> = {};
PLANTS_DATA.forEach((plant, index) => {
    PLANT_NAME_MAP[plant.name.toLowerCase()] = RECOMMENDED_PLANTS[index];
});

export default function PlantRecommendationResultScreen() {
    const params = useLocalSearchParams();
    const location = (params.location as string) || 'Lokasi Tidak Diketahui';
    const experience = (params.experience as string) || 'pemula';
    const plantResult = (params.plantResult as string) || '';

    // State for display
    const [mlRecommendation, setMlRecommendation] = useState<string | null>(null);
    const [heroPlant, setHeroPlant] = useState(RECOMMENDED_PLANTS[0]);
    const [otherPlants, setOtherPlants] = useState(RECOMMENDED_PLANTS.slice(1));

    // Process plant result from params on mount
    useEffect(() => {
        if (plantResult) {
            setMlRecommendation(plantResult);

            // Try to find matching plant in our local data
            const matchedPlant = PLANT_NAME_MAP[plantResult.toLowerCase()];
            if (matchedPlant) {
                setHeroPlant({ ...matchedPlant, matchScore: 98 });
                setOtherPlants(RECOMMENDED_PLANTS.filter(p => p.id !== matchedPlant.id));
            } else {
                console.log('Plant not found in local data:', plantResult);
                // Keep showing the plant name from API in badge
            }
        }
    }, [plantResult]);

    const handlePlantSelect = (plantId: number) => {
        router.push({ pathname: '/plant-detail', params: { id: plantId.toString() } });
    };

    const handleAddToGarden = (plantId: number) => {
        router.push({ pathname: '/missions/[id]', params: { id: plantId.toString() } });
    };

    const handleShare = async () => {
        try {
            const shareMessage = `🌱 Rekomendasi Tanaman untuk Saya!\n\n` +
                `✨ ${heroPlant.name} (${heroPlant.matchScore}% Match)\n` +
                `⏱️ Waktu Tumbuh: ${heroPlant.growthTime}\n` +
                `📊 Tingkat Kesulitan: ${heroPlant.difficulty}\n\n` +
                `📝 ${heroPlant.description}\n\n` +
                `Dapatkan rekomendasi tanaman kamu di AgriPlay! 🌿`;

            const result = await Share.share({
                message: shareMessage,
                title: `Rekomendasi Tanaman: ${heroPlant.name}`,
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared with activity type:', result.activityType);
                } else {
                    console.log('Shared successfully');
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Gagal membagikan rekomendasi');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Hasil Analisis</ThemedText>
                <TouchableOpacity onPress={handleShare}>
                    <Ionicons name="share-social-outline" size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ML RECOMMENDATION BADGE */}
                {mlRecommendation && (
                    <View style={styles.mlBadge}>
                        <Ionicons name="sparkles" size={16} color="#059669" />
                        <ThemedText style={styles.mlBadgeText}>
                            {mlRecommendation}
                        </ThemedText>
                    </View>
                )}

                {/* TITLE BLOCK */}
                <View style={styles.titleBlock}>
                    <ThemedText type="title" style={styles.titleMain}>Rekomendasi Utama</ThemedText>
                    <ThemedText style={styles.titleSub}>
                        Berdasarkan iklim <ThemedText style={{ fontWeight: '700', color: '#059669' }}>{location}</ThemedText> & level <ThemedText style={{ fontWeight: '700', color: '#059669' }}>{experience.charAt(0).toUpperCase() + experience.slice(1)}</ThemedText>.
                    </ThemedText>
                </View>

                {/* HERO CARD (The Winner) */}
                <Pressable style={styles.heroCard} onPress={() => handlePlantSelect(heroPlant.id)}>
                    {/* Image Background */}
                    <View style={styles.heroImageContainer}>
                        <Image source={{ uri: heroPlant.image }} style={styles.heroImage} contentFit="cover" />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.heroGradient}
                        />
                        {/* Match Badge */}
                        <View style={styles.matchBadge}>
                            <Ionicons name="sparkles" size={12} color="#FFF" />
                            <ThemedText style={styles.matchText}>{heroPlant.matchScore}% Match</ThemedText>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.heroContent}>
                        <View style={styles.heroHeaderRow}>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="title" style={styles.heroName}>{heroPlant.name}</ThemedText>
                                <View style={styles.heroTags}>
                                    <View style={styles.tag}>
                                        <Ionicons name="time-outline" size={12} color="#6B7280" />
                                        <ThemedText style={styles.tagText}>{heroPlant.growthTime}</ThemedText>
                                    </View>
                                    <View style={styles.dot} />
                                    <View style={styles.tag}>
                                        <Ionicons name="bar-chart-outline" size={12} color="#6B7280" />
                                        <ThemedText style={styles.tagText}>{heroPlant.difficulty}</ThemedText>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.addBtn}
                                onPress={() => handleAddToGarden(heroPlant.id)}
                            >
                                <Ionicons name="add" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <ThemedText style={styles.heroDesc}>{heroPlant.description}</ThemedText>
                    </View>
                </Pressable>

                {/* ALTERNATIVES SECTION */}
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Alternatif Lainnya</ThemedText>
                    <ThemedText style={styles.sectionCount}>{otherPlants.length} Tanaman</ThemedText>
                </View>

                <View style={styles.grid}>
                    {otherPlants.map((plant) => (
                        <Pressable
                            key={plant.id}
                            style={styles.gridCard}
                            onPress={() => handlePlantSelect(plant.id)}
                        >
                            <View style={styles.gridImageWrapper}>
                                <Image source={{ uri: plant.image }} style={styles.gridImage} contentFit="cover" />
                                <View style={[styles.miniBadge, { backgroundColor: plant.color }]}>
                                    <ThemedText style={styles.miniBadgeText}>{plant.matchScore}%</ThemedText>
                                </View>
                            </View>

                            <View style={styles.gridContent}>
                                <ThemedText type="defaultSemiBold" style={styles.gridName} numberOfLines={1}>{plant.name}</ThemedText>
                                <View style={styles.gridMetaRow}>
                                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                                    <ThemedText style={styles.gridMetaText}>{plant.growthTime}</ThemedText>
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </View>

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
    headerTitle: {
        fontSize: 16, fontWeight: '700', color: '#111827',
    },

    // TITLES
    titleBlock: {
        marginTop: 8,
        marginBottom: 24,
    },
    titleMain: {
        fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 6,
    },
    titleSub: {
        fontSize: 15, color: '#6B7280', lineHeight: 22,
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
    heroImageContainer: {
        height: 200,
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%', height: '100%',
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    matchBadge: {
        position: 'absolute', top: 16, right: 16,
        backgroundColor: 'rgba(5, 150, 105, 0.9)', // Emerald strong
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backdropFilter: 'blur(4px)',
    },
    matchText: {
        color: '#FFF', fontSize: 12, fontWeight: '700',
    },
    heroContent: {
        padding: 20,
    },
    heroHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    heroName: {
        fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 6,
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
    addBtn: {
        width: 48, height: 48,
        borderRadius: 24,
        backgroundColor: '#059669',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    heroDesc: {
        fontSize: 14, color: '#4B5563', lineHeight: 22,
    },

    // ALTERNATIVES SECTION
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '700', color: '#111827',
    },
    sectionCount: {
        fontSize: 13, color: '#9CA3AF', fontWeight: '600', marginBottom: 2,
    },

    // GRID
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: GAP,
    },
    gridCard: {
        width: COLUMN_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1, borderColor: '#E5E7EB',
        marginBottom: 8,
    },
    gridImageWrapper: {
        height: 120, width: '100%', position: 'relative',
        backgroundColor: '#F3F4F6',
    },
    gridImage: {
        width: '100%', height: '100%',
    },
    miniBadge: {
        position: 'absolute', top: 8, left: 8,
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    },
    miniBadgeText: {
        color: '#FFF', fontSize: 10, fontWeight: '700',
    },
    gridContent: {
        padding: 12,
    },
    gridName: {
        fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4,
    },
    gridMetaRow: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    gridMetaText: {
        fontSize: 12, color: '#9CA3AF',
    },

    // ML API States
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    errorText: {
        fontSize: 13,
        color: '#92400E',
        flex: 1,
    },
    mlBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        marginBottom: 16,
        gap: 8,
        alignSelf: 'flex-start',
    },
    mlBadgeText: {
        fontSize: 14,
        color: '#059669',
        fontWeight: '600',
    },
});
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
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

// --- DATA (Diperbarui dengan Gambar Realistis) ---
const RECOMMENDED_PLANTS = [
    {
        id: 1,
        name: 'Kangkung Hidroponik',
        difficulty: 'Pemula',
        growthTime: '25 Hari',
        matchScore: 98,
        description: 'Juara ketahanan! Tumbuh sangat cepat di iklim Bojongsoang dan tahan genangan air.',
        image: 'https://images.unsplash.com/photo-1628169966858-5c4d6537eb64?auto=format&fit=crop&w=800&q=80',
        color: '#059669', // Emerald
    },
    {
        id: 2,
        name: 'Cabai Rawit',
        difficulty: 'Menengah',
        growthTime: '90 Hari',
        matchScore: 85,
        description: 'Cocok untuk dataran rendah panas.',
        image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80',
        color: '#DC2626', // Red
    },
    {
        id: 3,
        name: 'Tomat Cherry',
        difficulty: 'Menengah',
        growthTime: '70 Hari',
        matchScore: 82,
        description: 'Butuh sinar matahari penuh.',
        image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80',
        color: '#EA580C', // Orange
    },
    {
        id: 4,
        name: 'Sawi Hijau',
        difficulty: 'Pemula',
        growthTime: '30 Hari',
        matchScore: 95,
        description: 'Panen cepat, perawatan mudah.',
        image: 'https://images.unsplash.com/photo-1627306359556-c30c8858f96e?auto=format&fit=crop&w=400&q=80',
        color: '#65A30D', // Lime
    },
    {
        id: 5,
        name: 'Bayam Merah',
        difficulty: 'Pemula',
        growthTime: '25 Hari',
        matchScore: 92,
        description: 'Kaya zat besi, tumbuh cepat.',
        image: 'https://images.unsplash.com/photo-1588874673890-a29241513e9a?auto=format&fit=crop&w=400&q=80', // Ilustrasi bayam
        color: '#BE123C', // Rose
    },
    {
        id: 6,
        name: 'Terong Ungu',
        difficulty: 'Menengah',
        growthTime: '80 Hari',
        matchScore: 78,
        description: 'Butuh lahan agak luas.',
        image: 'https://images.unsplash.com/photo-1623955938225-b873e27a6962?auto=format&fit=crop&w=400&q=80',
        color: '#7E22CE', // Purple
    },
];

export default function PlantRecommendationResultScreen() {
    const heroPlant = RECOMMENDED_PLANTS[0];
    const otherPlants = RECOMMENDED_PLANTS.slice(1);

    const handlePlantSelect = (plantId: number) => {
        // Navigasi ke detail
        console.log("Selected:", plantId);
    };

    const handleAddToGarden = (plantName: string) => {
        console.log("Added to garden:", plantName);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Hasil Analisis</ThemedText>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="share-social-outline" size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* TITLE BLOCK */}
                <View style={styles.titleBlock}>
                    <ThemedText type="title" style={styles.titleMain}>Rekomendasi Utama</ThemedText>
                    <ThemedText style={styles.titleSub}>
                        Berdasarkan iklim <ThemedText style={{ fontWeight: '700', color: '#059669' }}>Bojongsoang</ThemedText> & level <ThemedText style={{ fontWeight: '700', color: '#059669' }}>Pemula</ThemedText>.
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
                                onPress={() => handleAddToGarden(heroPlant.name)}
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
    },
    iconBtn: {
        width: 40, height: 40,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1, borderColor: '#F3F4F6',
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
});
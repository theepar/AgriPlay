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
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Pastikan import ini sesuai path Anda, atau gunakan DUMMY DATA di bawah jika belum ada
// import { PLANTS_DATA } from '@/constants/plants'; 

const { width } = Dimensions.get('window');

// --- GRID CONFIGURATION ---
const PADDING_HORIZONTAL = 24;
const GAP = 16;
const COLUMN_WIDTH = (width - (PADDING_HORIZONTAL * 2) - GAP) / 2;

// --- DUMMY DATA GENERATOR (Agar code bisa langsung jalan) ---
const PLANTS_DATA = [
    { id: '1', name: 'Kentang Granola' }, { id: '2', name: 'Cabai Rawit' },
    { id: '3', name: 'Tomat Cherry' }, { id: '4', name: 'Sawi Hijau' },
    { id: '5', name: 'Bayam Merah' }, { id: '6', name: 'Terong Ungu' }
];

const activeMissions = PLANTS_DATA.map((plant, index) => ({
    id: plant.id,
    name: plant.name,
    difficulty: index % 3 === 0 ? 'Sulit' : index % 2 === 0 ? 'Sedang' : 'Mudah',
    progress: Math.floor(Math.random() * 90) + 10, // 10-100
    xpReward: (index + 1) * 150,
    daysLeft: Math.floor(Math.random() * 7) + 1,
    image: getPlantImage(plant.name)
}));

function getPlantImage(name: string) {
    // Menggunakan gambar Unsplash yang tajam & fresh
    const lower = name.toLowerCase();
    if (lower.includes('kentang')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=400';
    if (lower.includes('cabai')) return 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=400';
    if (lower.includes('tomat')) return 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=400';
    if (lower.includes('sawi')) return 'https://images.unsplash.com/photo-1627306359556-c30c8858f96e?q=80&w=400';
    return 'https://images.unsplash.com/photo-1622383563227-044011358d20?q=80&w=400'; // Fallback nature
}

// Modern Badge Colors (Soft BG + Strong Text)
const getDifficultyStyle = (diff: string) => {
    switch (diff) {
        case 'Sulit': return { bg: '#FEF2F2', text: '#DC2626' }; // Red-50, Red-600
        case 'Sedang': return { bg: '#FFFBEB', text: '#D97706' }; // Amber-50, Amber-600
        default: return { bg: '#ECFDF5', text: '#059669' };      // Emerald-50, Emerald-600
    }
};

export default function MissionsListScreen() {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Misi Aktif</ThemedText>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="filter" size={20} color="#111827" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* SUMMARY BANNER (Tetap Gradient tapi Rounded Modern) */}
                <View style={styles.summaryCard}>
                    <LinearGradient
                        colors={['#059669', '#10B981']} // Emerald Gradient
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.summaryGradient}
                    >
                        <View>
                            <Text style={styles.summaryLabel}>Total Misi Berjalan</Text>
                            <Text style={styles.summaryValue}>{activeMissions.length} Misi</Text>
                            <View style={styles.summaryBadge}>
                                <Text style={styles.summaryBadgeText}>Keep Going! 🔥</Text>
                            </View>
                        </View>
                        <View style={styles.summaryIconContainer}>
                            <Ionicons name="rocket" size={32} color="rgba(255,255,255,0.9)" />
                        </View>
                    </LinearGradient>
                </View>

                {/* SECTION HEADER */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Prioritas Utama</Text>
                    <Text style={styles.sectionSubtitle}>Selesaikan untuk XP</Text>
                </View>

                {/* --- MISSION GRID --- */}
                <View style={styles.grid}>
                    {activeMissions.map((mission) => {
                        const badgeStyle = getDifficultyStyle(mission.difficulty);

                        return (
                            <Pressable
                                key={mission.id}
                                style={styles.card}
                                onPress={() => router.push({ pathname: '/missions/[id]', params: { id: mission.id } })}
                            >
                                {/* Image Area */}
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: mission.image }}
                                        style={styles.cardImage}
                                        contentFit="cover"
                                        transition={300}
                                    />
                                    {/* Difficulty Badge (Top Right) */}
                                    <View style={[styles.diffBadge, { backgroundColor: badgeStyle.bg }]}>
                                        <Text style={[styles.diffText, { color: badgeStyle.text }]}>
                                            {mission.difficulty}
                                        </Text>
                                    </View>
                                </View>

                                {/* Card Body */}
                                <View style={styles.cardBody}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>{mission.name}</Text>

                                    {/* Info Chips Row */}
                                    <View style={styles.metaRow}>
                                        <View style={styles.metaChip}>
                                            <Ionicons name="flash" size={10} color="#F59E0B" />
                                            <Text style={styles.metaText}>{mission.xpReward} XP</Text>
                                        </View>
                                        <View style={styles.metaChip}>
                                            <Ionicons name="time-outline" size={10} color="#6B7280" />
                                            <Text style={styles.metaText}>{mission.daysLeft}h</Text>
                                        </View>
                                    </View>

                                    {/* Progress Section */}
                                    <View style={styles.progressSection}>
                                        <View style={styles.progressTextRow}>
                                            <Text style={styles.progressLabel}>Progres</Text>
                                            <Text style={styles.progressValue}>{mission.progress}%</Text>
                                        </View>
                                        <View style={styles.progressTrack}>
                                            <View style={[styles.progressFill, { width: `${mission.progress}%` }]} />
                                        </View>
                                    </View>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light Theme Background
    },
    content: {
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingBottom: 40,
    },

    // HEADER
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        backgroundColor: '#F9FAFB',
        zIndex: 10,
    },
    iconButton: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E5E7EB',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    headerTitle: {
        fontSize: 18, fontWeight: '700', color: '#111827',
    },

    // SUMMARY CARD
    summaryCard: {
        borderRadius: 24,
        marginBottom: 32,
        shadowColor: '#059669', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
    },
    summaryGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 24, borderRadius: 24,
    },
    summaryLabel: {
        color: '#D1FAE5', fontSize: 13, fontWeight: '600', marginBottom: 4,
    },
    summaryValue: {
        color: '#FFF', fontSize: 26, fontWeight: '800', marginBottom: 8,
    },
    summaryBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start',
    },
    summaryBadgeText: {
        color: '#FFF', fontSize: 12, fontWeight: '700',
    },
    summaryIconContainer: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },

    // SECTION
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20, fontWeight: '800', color: '#111827',
    },
    sectionSubtitle: {
        fontSize: 13, color: '#6B7280', fontWeight: '500', marginBottom: 4,
    },

    // GRID SYSTEM
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: GAP,
    },
    card: {
        width: COLUMN_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 16, // Extra spacing bawah
        borderWidth: 1, borderColor: '#F3F4F6',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },

    // IMAGE & BADGE
    imageContainer: {
        height: 110, width: '100%', position: 'relative',
        backgroundColor: '#F3F4F6',
    },
    cardImage: {
        width: '100%', height: '100%',
    },
    diffBadge: {
        position: 'absolute', top: 8, right: 8,
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
    },
    diffText: {
        fontSize: 10, fontWeight: '700',
    },

    // CARD BODY
    cardBody: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10,
    },

    // META CHIPS
    metaRow: {
        flexDirection: 'row', gap: 6, marginBottom: 14,
    },
    metaChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F9FAFB', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6,
        borderWidth: 1, borderColor: '#F3F4F6',
    },
    metaText: {
        fontSize: 11, color: '#4B5563', fontWeight: '600',
    },

    // PROGRESS
    progressSection: {
        width: '100%',
    },
    progressTextRow: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
    },
    progressLabel: {
        fontSize: 11, color: '#9CA3AF',
    },
    progressValue: {
        fontSize: 11, color: '#059669', fontWeight: '700',
    },
    progressTrack: {
        height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden',
    },
    progressFill: {
        height: '100%', backgroundColor: '#059669', borderRadius: 3,
    },
});
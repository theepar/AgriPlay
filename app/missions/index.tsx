import { ThemedText } from '@/components/themed-text';
import { PLANTS_DATA } from '@/constants/plants';
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

// --- GRID CONFIGURATION ---
const PADDING_HORIZONTAL = 24;
const GAP = 16;
const COLUMN_WIDTH = (width - (PADDING_HORIZONTAL * 2) - GAP) / 2;

const activeMissions = PLANTS_DATA.map((plant, index) => ({
    id: plant.id,
    name: plant.name,
    difficulty: plant.difficulty,
    progress: plant.progress,
    xpReward: plant.totalXp,
    daysLeft: Math.floor(Math.random() * 7) + 1,
    image: plant.image
}));

// Modern Badge Colors (Soft BG + Strong Text)
const getDifficultyStyle = (diff: string) => {
    switch (diff) {
        case 'Sulit': return { bg: '#FEF2F2', text: '#EF4444' }; // Red
        case 'Sedang': return { bg: '#FFFBEB', text: '#F59E0B' }; // Amber
        default: return { bg: '#ECFDF5', text: '#10B981' };      // Emerald
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
                {/* Empty View for spacing balance */}
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* SUMMARY BANNER */}
                <View style={styles.summaryCard}>
                    <LinearGradient
                        colors={['#059669', '#047857']} // Deep Emerald Gradient
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.summaryGradient}
                    >
                        {/* Decorative Circle */}
                        <View style={styles.summaryDecoration} />

                        <View>
                            <ThemedText style={styles.summaryLabel}>Misi Berjalan</ThemedText>
                            <View style={styles.valueRow}>
                                <ThemedText style={styles.summaryValue}>{activeMissions.length}</ThemedText>
                                <ThemedText style={styles.summaryUnit}>Tanaman</ThemedText>
                            </View>
                            <View style={styles.summaryBadge}>
                                <Ionicons name="flame" size={12} color="#FFF" />
                                <ThemedText style={styles.summaryBadgeText}>Keep Going!</ThemedText>
                            </View>
                        </View>

                        <View style={styles.summaryIconContainer}>
                            <Ionicons name="rocket" size={36} color="#FFF" />
                        </View>
                    </LinearGradient>
                </View>

                {/* SECTION HEADER */}
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Prioritas Utama</ThemedText>
                    <ThemedText style={styles.sectionSubtitle}>Selesaikan untuk XP</ThemedText>
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
                                    {/* Difficulty Badge */}
                                    <View style={[styles.diffBadge, { backgroundColor: badgeStyle.bg }]}>
                                        <ThemedText style={[styles.diffText, { color: badgeStyle.text }]}>
                                            {mission.difficulty}
                                        </ThemedText>
                                    </View>
                                </View>

                                {/* Card Body */}
                                <View style={styles.cardBody}>
                                    <ThemedText style={styles.cardTitle} numberOfLines={1}>
                                        {mission.name}
                                    </ThemedText>

                                    {/* Meta Row (XP & Time) */}
                                    <View style={styles.metaRow}>
                                        <View style={styles.metaItem}>
                                            <Ionicons name="flash" size={12} color="#F59E0B" />
                                            <ThemedText style={styles.metaText}>{mission.xpReward} XP</ThemedText>
                                        </View>
                                        <View style={styles.metaDivider} />
                                        <View style={styles.metaItem}>
                                            <Ionicons name="time-outline" size={12} color="#6B7280" />
                                            <ThemedText style={styles.metaText}>{mission.daysLeft} hari</ThemedText>
                                        </View>
                                    </View>

                                    {/* Progress Section */}
                                    <View style={styles.progressSection}>
                                        <View style={styles.progressHeader}>
                                            <ThemedText style={styles.progressLabel}>Progress</ThemedText>
                                            <ThemedText style={styles.progressValue}>{mission.progress}%</ThemedText>
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
        backgroundColor: '#F9FAFB', // Clean Light Gray
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
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18, fontWeight: '700', color: '#111827',
    },

    // SUMMARY CARD
    summaryCard: {
        borderRadius: 24,
        marginBottom: 32,
        // Green Shadow Glow
        shadowColor: '#059669', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8,
    },
    summaryGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 24, borderRadius: 24, position: 'relative', overflow: 'hidden',
    },
    summaryDecoration: {
        position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    summaryLabel: {
        color: '#D1FAE5', fontSize: 13, fontWeight: '600', marginBottom: 4,
    },
    valueRow: {
        flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 12,
    },
    summaryValue: {
        color: '#FFF', fontSize: 32, fontWeight: '800',
    },
    summaryUnit: {
        color: '#D1FAE5', fontSize: 14, fontWeight: '500',
    },
    summaryBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
        flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    },
    summaryBadgeText: {
        color: '#FFF', fontSize: 12, fontWeight: '700',
    },
    summaryIconContainer: {
        width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },

    // SECTION HEADER
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '800', color: '#111827',
    },
    sectionSubtitle: {
        fontSize: 13, color: '#6B7280', fontWeight: '500',
    },

    // GRID SYSTEM
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: GAP,
    },
    card: {
        width: COLUMN_WIDTH,
        backgroundColor: '#FFFFFF',
        borderRadius: 24, // Lebih bulat
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1, borderColor: '#F3F4F6',
        // Soft Modern Shadow
        shadowColor: '#059669', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
    },

    // IMAGE & BADGE
    imageContainer: {
        height: 120, width: '100%', position: 'relative',
        backgroundColor: '#F3F4F6',
    },
    cardImage: {
        width: '100%', height: '100%',
    },
    diffBadge: {
        position: 'absolute', top: 10, right: 10,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
        backgroundColor: '#FFFFFF', // Fallback
    },
    diffText: {
        fontSize: 10, fontWeight: '700',
    },

    // CARD BODY
    cardBody: {
        padding: 14,
    },
    cardTitle: {
        fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12,
    },

    // META INFO
    metaRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
    },
    metaItem: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    metaText: {
        fontSize: 11, color: '#4B5563', fontWeight: '600',
    },
    metaDivider: {
        width: 1, height: 12, backgroundColor: '#E5E7EB',
    },

    // PROGRESS
    progressSection: {
        width: '100%',
    },
    progressHeader: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
    },
    progressLabel: {
        fontSize: 11, color: '#9CA3AF', fontWeight: '500',
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
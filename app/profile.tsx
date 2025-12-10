import { ThemedText } from '@/components/themed-text';
import { PLANTS_DATA } from '@/constants/plants';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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

const PADDING_HORIZONTAL = 24;
const GAP = 16;

const COLUMN_WIDTH = (width - (PADDING_HORIZONTAL * 2) - GAP) / 2;

const USER_PROFILE = {
    name: 'Agra Master',
    handle: '@agramaster_id',
    bio: 'Petani urban spesialis hidroponik & tanaman obat. Mari hijaukan bumi! 🌿',
    level: 19,
    xpCurrent: 1984,
    xpMax: 2500,
    stats: { plants: PLANTS_DATA.length, likes: '20.5K', harvests: 156 },
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop', // Gambar kebun estetik
    badges: [
        { id: 1, icon: 'water', color: '#3B82F6', bg: '#EFF6FF', name: 'Penyiram' },
        { id: 2, icon: 'leaf', color: '#10B981', bg: '#ECFDF5', name: 'Green Thumb' },
        { id: 3, icon: 'trophy', color: '#F59E0B', bg: '#FFFBEB', name: 'Juara' },
    ],
    plants: PLANTS_DATA.map((plant, index) => ({
        id: Number(plant.id),
        name: plant.name,
        status: ['Siap Panen', 'Berbunga', 'Butuh Air', 'Tumbuh', 'Bibit'][index] || 'Tumbuh',
        image: plant.image,
        progress: plant.progress,
        color: plant.color
    }))
};

export default function ProfileScreen() {
    const xpPercentage = (USER_PROFILE.xpCurrent / USER_PROFILE.xpMax) * 100;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* 1. HEADER & COVER */}
                <View style={styles.headerContainer}>
                    <Image source={{ uri: USER_PROFILE.coverImage }} style={styles.coverImage} contentFit="cover" />
                    <View style={styles.overlay} />

                    {/* Navbar Absolute */}
                    <View style={styles.navBar}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.navButton}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. PROFILE INFO (Overlapping) */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarRow}>
                        <View style={styles.avatarWrapper}>
                            <Image source={{ uri: USER_PROFILE.avatar }} style={styles.avatar} />
                            <Pressable style={styles.editIcon}>
                                <Ionicons name="camera" size={14} color="#FFF" />
                            </Pressable>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.editProfileBtn}>
                                <ThemedText style={styles.editProfileText}>Edit Profil</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.textInfo}>
                        <ThemedText type="title" style={styles.name}>{USER_PROFILE.name}</ThemedText>
                        <ThemedText style={styles.handle}>{USER_PROFILE.handle}</ThemedText>
                        <ThemedText style={styles.bio}>{USER_PROFILE.bio}</ThemedText>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <ThemedText type="defaultSemiBold" style={styles.statValue}>{USER_PROFILE.level}</ThemedText>
                            <ThemedText style={styles.statLabel}>Level</ThemedText>
                        </View>
                        <View style={styles.verticalLine} />
                        <View style={styles.statItem}>
                            <ThemedText type="defaultSemiBold" style={styles.statValue}>{USER_PROFILE.stats.plants}</ThemedText>
                            <ThemedText style={styles.statLabel}>Tanaman</ThemedText>
                        </View>
                        <View style={styles.verticalLine} />
                        <View style={styles.statItem}>
                            <ThemedText type="defaultSemiBold" style={styles.statValue}>{USER_PROFILE.stats.likes}</ThemedText>
                            <ThemedText style={styles.statLabel}>Likes</ThemedText>
                        </View>
                    </View>

                    {/* XP Progress */}
                    <View style={styles.xpSection}>
                        <View style={styles.xpHeader}>
                            <ThemedText style={styles.xpLabel}>Menuju Level {USER_PROFILE.level + 1}</ThemedText>
                            <ThemedText style={styles.xpValue}>{USER_PROFILE.xpCurrent} / {USER_PROFILE.xpMax} XP</ThemedText>
                        </View>
                        <View style={styles.xpTrack}>
                            <View style={[styles.xpFill, { width: `${xpPercentage}%` }]} />
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* 3. BADGES */}
                <View style={styles.sectionContainer}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Pencapaian</ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
                        {USER_PROFILE.badges.map((badge) => (
                            <View key={badge.id} style={[styles.badgeCard, { backgroundColor: badge.bg }]}>
                                <Ionicons name={badge.icon as any} size={20} color={badge.color} />
                                <ThemedText style={[styles.badgeText, { color: badge.color }]}>{badge.name}</ThemedText>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* 4. GARDEN GRID */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>Kebun Saya</ThemedText>
                        <TouchableOpacity onPress={() => router.push('/virtual-garden')}>
                            <ThemedText style={styles.seeAll}>Lihat Semua</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.grid}>
                        {USER_PROFILE.plants
                            .sort((a, b) => b.progress - a.progress)
                            .slice(0, 2)
                            .map((plant) => (
                                <Pressable
                                    key={plant.id}
                                    style={styles.plantCard}
                                    onPress={() => router.push({ pathname: '/missions/[id]', params: { id: plant.id.toString() } })}
                                >
                                    {/* Image */}
                                    <Image source={{ uri: plant.image }} style={styles.plantImage} contentFit="cover" />

                                    {/* Status Badge Over Image */}
                                    <View style={styles.statusBadge}>
                                        <ThemedText style={styles.statusText}>{plant.status}</ThemedText>
                                    </View>

                                    {/* Info */}
                                    <View style={styles.plantInfo}>
                                        <ThemedText type="defaultSemiBold" style={styles.plantName}>{plant.name}</ThemedText>

                                        {/* Mini Progress */}
                                        <View style={styles.miniProgressTrack}>
                                            <View style={[styles.miniProgressFill, { width: `${plant.progress}%`, backgroundColor: plant.color }]} />
                                        </View>
                                    </View>
                                </Pressable>
                            ))}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    // COVER
    headerContainer: {
        height: 180,
        width: '100%',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slight dim for text visibility if needed
    },
    navBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
    },

    // PROFILE INFO
    profileSection: {
        paddingHorizontal: 24,
        marginTop: -40, // Pull up to overlap cover
    },
    avatarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        borderWidth: 4,
        borderColor: '#FFFFFF', // White border to cut out from cover
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#059669',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    headerActions: {
        marginBottom: 4,
    },
    editProfileBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#fff',
    },
    editProfileText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    textInfo: {
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 2,
    },
    handle: {
        fontSize: 14,
        color: '#059669',
        fontWeight: '600',
        marginBottom: 8,
    },
    bio: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },

    // STATS
    statsCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    verticalLine: {
        width: 1,
        height: 24,
        backgroundColor: '#E5E7EB',
    },

    // XP
    xpSection: {
        marginBottom: 24,
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    xpLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    xpValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#059669',
    },
    xpTrack: {
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        overflow: 'hidden',
    },
    xpFill: {
        height: '100%',
        backgroundColor: '#059669',
        borderRadius: 4,
    },

    divider: {
        height: 8,
        backgroundColor: '#F9FAFB',
        marginBottom: 24,
    },

    // SECTIONS
    sectionContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
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

    // BADGES
    badgesScroll: {
        gap: 12,
    },
    badgeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 8,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // GRID
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
    },
    plantCard: {
        width: COLUMN_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 8,
    },
    plantImage: {
        width: '100%',
        height: 140, // Height fixed for neat grid
    },
    statusBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#111827',
    },
    plantInfo: {
        padding: 12,
    },
    plantName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    miniProgressTrack: {
        height: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 2,
        overflow: 'hidden',
    },
    miniProgressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
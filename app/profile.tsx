import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { PLANTS_DATA } from '@/constants/plants';
import { getLevelInfo, getPlantProgress, useGarden } from '@/lib/garden-store';
import { resetTo, useSession } from '@/lib/session';
import { goBack } from '@/lib/navigation';
import { showAlert } from '@/lib/alert';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
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

const COVER_IMAGE = 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=800&auto=format&fit=crop'; // Gambar kebun estetik

interface Badge {
    id: string;
    icon: ComponentProps<typeof Ionicons>['name'];
    color: string;
    bg: string;
    name: string;
    unlocked: boolean;
}

export default function ProfileScreen() {
    const { user, signOut } = useSession();
    const { xp, taskStatus } = useGarden();
    const { level, xpIntoLevel, xpForNextLevel } = getLevelInfo(xp);
    const xpPercentage = (xpIntoLevel / xpForNextLevel) * 100;

    const name = user?.name ?? 'Petani Muda';
    const handle = '@' + (user?.email.split('@')[0] ?? 'agrarian');

    const plants = PLANTS_DATA.map(plant => {
        const { percent, completed, activeTask } = getPlantProgress(plant, taskStatus);
        return {
            id: plant.id,
            name: plant.name,
            status: activeTask ? activeTask.title : 'Siap Panen',
            image: plant.image,
            progress: percent,
            completed,
            color: plant.color,
        };
    });
    const completedTasks = plants.reduce((sum, plant) => sum + plant.completed, 0);

    // Pencapaian dihitung dari progres nyata, bukan data statis.
    const badges: Badge[] = [
        { id: 'care', icon: 'water', color: '#3B82F6', bg: '#EFF6FF', name: 'Rajin Merawat', unlocked: completedTasks >= 5 },
        { id: 'harvest', icon: 'leaf', color: '#10B981', bg: '#ECFDF5', name: 'Green Thumb', unlocked: plants.some(p => p.progress === 100) },
        { id: 'level', icon: 'trophy', color: '#F59E0B', bg: '#FFFBEB', name: 'Juara (Lv 5)', unlocked: level >= 5 },
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            resetTo('/');
        } catch {
            showAlert('Gagal keluar', 'Terjadi kesalahan saat menyimpan data. Coba lagi.');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* 1. HEADER & COVER */}
                <View style={styles.headerContainer}>
                    <Image source={{ uri: COVER_IMAGE }} style={styles.coverImage} contentFit="cover" />
                    <View style={styles.overlay} />

                    {/* Navbar Absolute */}
                    <View style={styles.navBar}>
                        <TouchableOpacity onPress={() => goBack()} style={styles.navButton} accessibilityRole="button" accessibilityLabel="Kembali">
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 2. PROFILE INFO (Overlapping) */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarRow}>
                        <View style={styles.avatarWrapper}>
                            <Avatar name={name} size={88} style={styles.avatar} />
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.editProfileBtn}>
                                <ThemedText style={styles.editProfileText}>Edit Profil</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.textInfo}>
                        <ThemedText type="title" style={styles.name}>{name}</ThemedText>
                        <ThemedText style={styles.handle}>{handle}</ThemedText>
                        <ThemedText style={styles.bio}>Sedang belajar bertani bersama Agrarian 🌿</ThemedText>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <ThemedText type="defaultSemiBold" style={styles.statValue}>{level}</ThemedText>
                            <ThemedText style={styles.statLabel}>Level</ThemedText>
                        </View>
                        <View style={styles.verticalLine} />
                        <View style={styles.statItem}>
                            <ThemedText type="defaultSemiBold" style={styles.statValue}>{plants.length}</ThemedText>
                            <ThemedText style={styles.statLabel}>Tanaman</ThemedText>
                        </View>
                        <View style={styles.verticalLine} />
                        <View style={styles.statItem}>
                            <ThemedText type="defaultSemiBold" style={styles.statValue}>{completedTasks}</ThemedText>
                            <ThemedText style={styles.statLabel}>Tugas Selesai</ThemedText>
                        </View>
                    </View>

                    {/* XP Progress */}
                    <View style={styles.xpSection}>
                        <View style={styles.xpHeader}>
                            <ThemedText style={styles.xpLabel}>Menuju Level {level + 1}</ThemedText>
                            <ThemedText style={styles.xpValue}>{xpIntoLevel} / {xpForNextLevel} XP</ThemedText>
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
                        {badges.map((badge) => (
                            <View
                                key={badge.id}
                                style={[styles.badgeCard, { backgroundColor: badge.unlocked ? badge.bg : '#F3F4F6' }]}
                            >
                                <Ionicons name={badge.unlocked ? badge.icon : 'lock-closed'} size={20} color={badge.unlocked ? badge.color : '#9CA3AF'} />
                                <ThemedText style={[styles.badgeText, { color: badge.unlocked ? badge.color : '#9CA3AF' }]}>{badge.name}</ThemedText>
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
                        {[...plants]
                            .sort((a, b) => b.progress - a.progress)
                            .slice(0, 2)
                            .map((plant) => (
                                <Pressable
                                    key={plant.id}
                                    style={styles.plantCard}
                                    onPress={() => router.push({ pathname: '/missions/[id]', params: { id: plant.id } })}
                                >
                                    {/* Image */}
                                    <Image source={{ uri: plant.image }} style={styles.plantImage} contentFit="cover" />

                                    {/* Status Badge Over Image */}
                                    <View style={styles.statusBadge}>
                                        <ThemedText style={styles.statusText} numberOfLines={1}>{plant.status}</ThemedText>
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

                {/* 5. LOGOUT */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                        <ThemedText style={styles.logoutText}>Keluar</ThemedText>
                    </TouchableOpacity>
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
        borderWidth: 4,
        borderColor: '#FFFFFF', // White border to cut out from cover
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
        maxWidth: COLUMN_WIDTH - 16,
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

    // LOGOUT
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#DC2626',
    },
});
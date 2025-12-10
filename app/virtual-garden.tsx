import { ThemedText } from '@/components/themed-text';
import { PLANTS_DATA } from '@/constants/plants';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// --- GRID CONFIGURATION ---
const PADDING_HORIZONTAL = 24;
const GAP = 16;
const COLUMN_WIDTH = (width - (PADDING_HORIZONTAL * 2) - GAP) / 2;

// --- DATA: MY PLANTS ---
const MY_PROFILE = {
    name: 'Agra Master',
    plants: PLANTS_DATA.map((plant, index) => ({
        id: Number(plant.id),
        name: plant.name,
        status: ['Siap Panen', 'Berbunga', 'Butuh Air', 'Tumbuh', 'Bibit'][index] || 'Tumbuh',
        color: plant.color,
        image: plant.image
    }))
};

// --- DATA: OTHER GARDENS (COMMUNITY) ---
const OTHER_GARDENS = [
    {
        id: 101,
        ownerName: 'Sarah Gardener',
        ownerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150',
        gardenName: 'Sarah\'s Sanctuary',
        coverImage: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80',
        level: 24,
        plantCount: 45,
        isFollowing: false,
    },
    {
        id: 102,
        ownerName: 'Budi Hydro',
        ownerAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150',
        gardenName: 'Hydroponic Heaven',
        coverImage: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
        level: 40,
        plantCount: 112,
        isFollowing: true,
    },
    {
        id: 103,
        ownerName: 'Citra Lestari',
        ownerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150',
        gardenName: 'Kebun Teras Citra',
        coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
        level: 12,
        plantCount: 8,
        isFollowing: false,
    },
];

export default function VirtualGardenScreen() {
    const [activeTab, setActiveTab] = useState<'my_garden' | 'explore'>('my_garden');
    const [searchQuery, setSearchQuery] = useState('');

    // Logic untuk menentukan placeholder text
    const searchPlaceholder = activeTab === 'my_garden'
        ? "Cari tanaman koleksimu..."
        : "Cari nama teman atau kebun...";

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* HEADER FIXED (Tidak ikut scroll) */}
            <View style={styles.headerContainer}>
                <View style={styles.navRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.headerTitle}>Virtual Garden</ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                {/* SEGMENTED CONTROL (TABS) */}
                <View style={styles.tabContainer}>
                    <Pressable
                        style={[styles.tabButton, activeTab === 'my_garden' && styles.tabActive]}
                        onPress={() => { setActiveTab('my_garden'); setSearchQuery(''); }}
                    >
                        <ThemedText style={[styles.tabText, activeTab === 'my_garden' && styles.tabTextActive]}>Koleksi Saya</ThemedText>
                    </Pressable>
                    <Pressable
                        style={[styles.tabButton, activeTab === 'explore' && styles.tabActive]}
                        onPress={() => { setActiveTab('explore'); setSearchQuery(''); }}
                    >
                        <ThemedText style={[styles.tabText, activeTab === 'explore' && styles.tabTextActive]}>Jelajahi</ThemedText>
                    </Pressable>
                </View>

                {/* SEARCH BAR (Context Aware) */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder={searchPlaceholder}
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* KONTEN BERDASARKAN TAB */}
                {activeTab === 'my_garden' ? (
                    <MyGardenView searchQuery={searchQuery} />
                ) : (
                    <ExploreView searchQuery={searchQuery} />
                )}
            </ScrollView>
        </View>
    );
}

// --- SUB-COMPONENT: MY GARDEN (Grid View) ---
function MyGardenView({ searchQuery }: { searchQuery: string }) {
    const filteredPlants = MY_PROFILE.plants.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePlantPress = (plantId: number) => {
        router.push({ pathname: '/plant-detail', params: { id: plantId.toString() } });
    };

    return (
        <View style={styles.gridContainer}>
            <View style={styles.sectionHeader}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Tanaman ({filteredPlants.length})</ThemedText>
            </View>

            <View style={styles.grid}>
                {filteredPlants.map((plant) => (
                    <Pressable key={plant.id} style={styles.plantCard} onPress={() => handlePlantPress(plant.id)}>
                        <View style={styles.plantImageWrapper}>
                            <Image source={{ uri: plant.image }} style={styles.plantImage} contentFit="cover" />
                            <View style={[styles.statusBadge, { backgroundColor: plant.color }]}>
                                <ThemedText style={styles.statusText}>{plant.status}</ThemedText>
                            </View>
                        </View>
                        <View style={styles.plantCardContent}>
                            <ThemedText type="defaultSemiBold" style={styles.plantName}>{plant.name}</ThemedText>
                            <TouchableOpacity style={styles.plantActionBtn} onPress={() => handlePlantPress(plant.id)}>
                                <ThemedText style={styles.plantActionText}>Detail</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                ))}
            </View>
            {filteredPlants.length === 0 && <EmptyState text="Tanaman tidak ditemukan." />}
        </View>
    );
}

// --- SUB-COMPONENT: EXPLORE (List/Wide Card View) ---
function ExploreView({ searchQuery }: { searchQuery: string }) {
    const filteredGardens = OTHER_GARDENS.filter(g =>
        g.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.gardenName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.listContainer}>
            <View style={styles.sectionHeader}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Rekomendasi Kebun</ThemedText>
            </View>

            <View style={styles.list}>
                {filteredGardens.map((garden) => (
                    <Pressable key={garden.id} style={styles.gardenCard}>
                        {/* Cover Image */}
                        <View style={styles.gardenCoverWrapper}>
                            <Image source={{ uri: garden.coverImage }} style={styles.gardenCover} contentFit="cover" />
                            <View style={styles.gardenOverlay} />

                            {/* Stats Badge on Cover */}
                            <View style={styles.gardenStats}>
                                <Ionicons name="leaf" size={12} color="#FFF" />
                                <ThemedText style={styles.gardenStatsText}>{garden.plantCount} Tanaman</ThemedText>
                            </View>
                        </View>

                        {/* Info Section */}
                        <View style={styles.gardenInfo}>
                            <View style={styles.gardenOwnerRow}>
                                <Image source={{ uri: garden.ownerAvatar }} style={styles.ownerAvatar} />
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="defaultSemiBold" style={styles.gardenName}>{garden.gardenName}</ThemedText>
                                    <ThemedText style={styles.ownerName}>{garden.ownerName} • Lvl {garden.level}</ThemedText>
                                </View>

                                {/* Visit Button */}
                                <TouchableOpacity style={[styles.visitBtn, garden.isFollowing ? styles.visitBtnOutline : styles.visitBtnFilled]}>
                                    <ThemedText style={[styles.visitBtnText, garden.isFollowing ? styles.textGreen : styles.textWhite]}>
                                        {garden.isFollowing ? 'Teman' : 'Kunjungi'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                ))}
            </View>
            {filteredGardens.length === 0 && <EmptyState text="Kebun tidak ditemukan." />}
        </View>
    );
}

// Helper Empty State
const EmptyState = ({ text }: { text: string }) => (
    <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.5 }}>
        <Ionicons name="search" size={48} color="#9CA3AF" />
        <ThemedText style={{ marginTop: 10, color: '#6B7280' }}>{text}</ThemedText>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    // --- HEADER ---
    headerContainer: {
        backgroundColor: '#F9FAFB',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingHorizontal: PADDING_HORIZONTAL,
        paddingBottom: 16,
        zIndex: 10, // Sticky effect
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: { padding: 8, marginLeft: -8 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

    // TABS
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    tabTextActive: {
        color: '#059669',
        fontWeight: '700',
    },

    // SEARCH
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        height: 50,
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#111827',
        height: '100%',
    },

    scrollContent: {
        paddingBottom: 40,
    },

    // --- SHARED ---
    sectionHeader: { marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

    // --- MY GARDEN STYLES ---
    gridContainer: { paddingHorizontal: PADDING_HORIZONTAL },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
    plantCard: {
        width: COLUMN_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 16,
        elevation: 1,
    },
    plantImageWrapper: { height: 120, position: 'relative' },
    plantImage: { width: '100%', height: '100%' },
    statusBadge: {
        position: 'absolute', top: 8, left: 8,
        paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
    },
    statusText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    plantCardContent: { padding: 12 },
    plantName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
    plantActionBtn: {
        backgroundColor: '#ECFDF5', paddingVertical: 6, alignItems: 'center', borderRadius: 8,
    },
    plantActionText: { fontSize: 12, fontWeight: '600', color: '#059669' },

    // --- EXPLORE STYLES ---
    listContainer: { paddingHorizontal: PADDING_HORIZONTAL },
    list: { gap: 16 },
    gardenCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 16,
        elevation: 1,
    },
    gardenCoverWrapper: { height: 140, position: 'relative' },
    gardenCover: { width: '100%', height: '100%' },
    gardenOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    gardenStats: {
        position: 'absolute', bottom: 12, left: 12,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    gardenStatsText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

    gardenInfo: { padding: 16 },
    gardenOwnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    ownerAvatar: { width: 40, height: 40, borderRadius: 20 },
    gardenName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    ownerName: { fontSize: 13, color: '#6B7280' },

    visitBtn: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
    },
    visitBtnFilled: { backgroundColor: '#059669', borderColor: '#059669' },
    visitBtnOutline: { backgroundColor: '#FFF', borderColor: '#D1D5DB' },
    visitBtnText: { fontSize: 12, fontWeight: '700' },
    textWhite: { color: '#FFF' },
    textGreen: { color: '#059669' },
});
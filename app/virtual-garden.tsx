import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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

// Logic Grid 2 Kolom
const PADDING_HORIZONTAL = 20;
const GAP = 15;
// Lebar kartu = (Layar - Padding Kiri - Padding Kanan - Jarak Tengah) / 2
const CARD_WIDTH = (width - (PADDING_HORIZONTAL * 2) - GAP) / 2;

// --- FIXED DATA (URL Stabil) ---
const MY_PROFILE = {
    name: 'Agri Master',
    level: 19,
    xpCurrent: 1984,
    xpMax: 2500,
    likes: '20.5K',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    plants: [
        {
            id: 1,
            name: 'Kentang',
            status: 'Siap Panen',
            // Gambar Kentang
            image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80'
        },
        {
            id: 2,
            name: 'Kacang Hijau',
            status: 'Berbunga',
            // Gambar Kacang Polong/Hijau
            image: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&w=500&q=80'
        },
        {
            id: 3,
            name: 'Vanilla',
            status: 'Butuh Air',
            // Gambar Bunga Vanilla/Anggrek Putih
            image: 'https://images.unsplash.com/photo-1606900165780-1a74e09ba4d7?auto=format&fit=crop&w=500&q=80'
        },
        {
            id: 4,
            name: 'Kayu Manis',
            status: 'Tumbuh',
            // Gambar Batang Kayu Manis
            image: 'https://images.unsplash.com/photo-1549589379-91899e69c020?auto=format&fit=crop&w=500&q=80'
        },
        {
            id: 5,
            name: 'Terong',
            status: 'Berbuah',
            // Gambar Terong
            image: 'https://images.unsplash.com/photo-1623955938225-b873e27a6962?auto=format&fit=crop&w=500&q=80'
        },
        {
            id: 6,
            name: 'Kemangi',
            status: 'Sehat',
            // Gambar Daun Kemangi/Basil
            image: 'https://images.unsplash.com/photo-1612509833501-c8167f259691?auto=format&fit=crop&w=500&q=80'
        },
    ]
};

export default function VirtualGardenScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const xpPercentage = (MY_PROFILE.xpCurrent / MY_PROFILE.xpMax) * 100;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Background */}
            <LinearGradient
                colors={['#166534', '#14532d', '#064e3b']}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.decorativeCircle} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled" // Agar klik hasil search tidak menutup keyboard duluan
            >

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="settings-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            <Image source={{ uri: MY_PROFILE.avatar }} style={styles.avatar} contentFit="cover" />
                            <View style={styles.onlineIndicator} />
                        </View>

                        <View style={styles.profileInfo}>
                            <ThemedText style={styles.userName}>{MY_PROFILE.name}</ThemedText>
                            <View style={styles.badgesRow}>
                                <View style={styles.levelBadge}>
                                    <Ionicons name="ribbon" size={14} color="#FFD700" />
                                    <ThemedText style={styles.levelText}>Lvl {MY_PROFILE.level}</ThemedText>
                                </View>
                                <View style={styles.likesBadge}>
                                    <Ionicons name="heart" size={14} color="#F87171" />
                                    <ThemedText style={styles.likesText}>{MY_PROFILE.likes}</ThemedText>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.xpContainer}>
                        <View style={styles.xpLabelRow}>
                            <ThemedText style={styles.xpLabel}>XP Progress</ThemedText>
                            <ThemedText style={styles.xpValue}>{MY_PROFILE.xpCurrent} / {MY_PROFILE.xpMax}</ThemedText>
                        </View>
                        <View style={styles.xpTrack}>
                            <LinearGradient
                                colors={['#4ade80', '#22c55e']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.xpFill, { width: `${xpPercentage}%` }]}
                            />
                        </View>
                    </View>
                </View>

                {/* --- SEARCH SECTION (Z-Index Tinggi agar overlay di atas grid) --- */}
                <View style={[styles.searchSection, { zIndex: 100 }]}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Cari tanaman..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={() => setIsSearching(true)}
                        // onBlur kita handle manual agar klik result tidak hilang
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); setIsSearching(false) }}>
                                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* OVERLAY RESULT - Menempel Relatif pada SearchSection */}
                    {isSearching && searchQuery.length > 0 && (
                        <View style={styles.dropdownContainer}>
                            <TouchableOpacity style={styles.resultItem}>
                                <Image source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100' }} style={styles.resultAvatar} />
                                <View>
                                    <ThemedText style={styles.resultNameText}>Kebun {searchQuery}</ThemedText>
                                    <ThemedText style={styles.resultSubText}>Level 12 • 4 Tanaman</ThemedText>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.resultItem}>
                                <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100' }} style={styles.resultAvatar} />
                                <View>
                                    <ThemedText style={styles.resultNameText}>Taman {searchQuery} 2</ThemedText>
                                    <ThemedText style={styles.resultSubText}>Level 25 • 8 Tanaman</ThemedText>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* --- GRID SECTION (Z-Index Rendah) --- */}
                <View style={{ zIndex: 1, paddingHorizontal: PADDING_HORIZONTAL }}>
                    <View style={styles.sectionTitleRow}>
                        <ThemedText style={styles.sectionTitle}>Koleksi Tanaman</ThemedText>
                        <TouchableOpacity>
                            <ThemedText style={styles.seeAll}>Lihat Semua</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.plantsGrid}>
                        {MY_PROFILE.plants.map((plant) => (
                            <Pressable key={plant.id} style={styles.plantCard}>
                                <Image
                                    source={{ uri: plant.image }}
                                    style={styles.plantImage}
                                    contentFit="cover"
                                    cachePolicy="memory-disk" // Caching agar tidak reload terus
                                />

                                <View style={styles.statusBadge}>
                                    <ThemedText style={styles.statusText}>{plant.status}</ThemedText>
                                </View>

                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                                    style={styles.cardGradient}
                                >
                                    <ThemedText style={styles.plantName} numberOfLines={1}>{plant.name}</ThemedText>
                                    <View style={styles.cardActionRow}>
                                        <Ionicons name="water" size={14} color="#6EE7B7" />
                                        <ThemedText style={styles.actionText}>Siram</ThemedText>
                                    </View>
                                </LinearGradient>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB Camera */}
            <TouchableOpacity style={styles.fab}>
                <LinearGradient
                    colors={['#4ade80', '#16a34a']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="scan" size={28} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#064e3b',
    },
    decorativeCircle: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    // Profile
    profileSection: {
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 24,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#4ade80',
        backgroundColor: '#ccc', // Placeholder color saat loading
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        backgroundColor: '#22c55e',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#064e3b',
    },
    profileInfo: { flex: 1 },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 6 },
    badgesRow: { flexDirection: 'row', gap: 8 },
    levelBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(253, 224, 71, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4,
    },
    levelText: { color: '#FDE047', fontSize: 12, fontWeight: '700' },
    likesBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(248, 113, 113, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4,
    },
    likesText: { color: '#FCA5A5', fontSize: 12, fontWeight: '700' },
    xpContainer: { width: '100%' },
    xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    xpLabel: { color: '#D1FAE5', fontSize: 12 },
    xpValue: { color: '#FFF', fontSize: 12, fontWeight: '600' },
    xpTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
    xpFill: { height: '100%', borderRadius: 3 },

    // --- Search Section Styles ---
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
        position: 'relative', // Penting untuk absolute positioning dropdown
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1F2937',
        height: '100%', // Full height agar touch area besar
    },
    dropdownContainer: {
        position: 'absolute',
        top: 60, // 50 (tinggi input) + 10 (margin)
        left: 20, // Sesuai paddingHorizontal parent
        right: 20,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    resultAvatar: {
        width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#eee'
    },
    resultNameText: {
        color: '#111827', fontWeight: 'bold', fontSize: 14,
    },
    resultSubText: {
        color: '#6B7280', fontSize: 12, marginTop: 2,
    },

    // --- Grid Styles ---
    sectionTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    seeAll: { color: '#4ade80', fontSize: 14 },

    plantsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP, // Menggunakan gap native Flexbox
    },
    plantCard: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.4, // Sedikit lebih tinggi agar proporsional
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1f2937',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    plantImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2d3748', // Fallback color jika gambar loading
    },
    statusBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 2,
    },
    statusText: { color: '#FFF', fontSize: 10, fontWeight: '600' },
    cardGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 90,
        justifyContent: 'flex-end',
        padding: 12,
    },
    plantName: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
    cardActionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    actionText: { color: '#6EE7B7', fontSize: 12, fontWeight: '600' },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        shadowColor: '#4ade80',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    fabGradient: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});
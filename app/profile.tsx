import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Dummy Data
const MY_PROFILE = {
    name: 'Agri',
    level: 19,
    xp: 1984,
    likes: 20000,
    avatar: require('@/assets/images/homepage-1.png'), // Placeholder
    plants: [
        { id: 1, name: 'Kentang', image: require('@/assets/images/kentang.png') },
        { id: 2, name: 'Kacang Hijau', image: require('@/assets/images/homepage-2.png') },
        { id: 3, name: 'Vanilla', image: require('@/assets/images/homepage-3.png') },
        { id: 4, name: 'Kayu Manis', image: require('@/assets/images/homepage-1.png') },
        { id: 5, name: 'Terong', image: require('@/assets/images/homepage-2.png') },
        { id: 6, name: 'Kemangi', image: require('@/assets/images/homepage-3.png') },
    ]
};

export default function ProfileScreen() {
    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#2D5F3F" />
                </Pressable>
                <ThemedText style={styles.headerTitle}>Profil Saya</ThemedText>
                <Pressable style={styles.settingsButton}>
                    <Ionicons name="settings-outline" size={24} color="#2D5F3F" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <Image source={MY_PROFILE.avatar} style={styles.avatar} contentFit="cover" />
                        <Pressable style={styles.cameraButton}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </Pressable>
                    </View>

                    <View style={styles.likeContainer}>
                        <View style={styles.likeIconBg}>
                            <Ionicons name="heart" size={20} color="#FF5252" />
                        </View>
                        <ThemedText style={styles.likeCount}>{MY_PROFILE.likes}</ThemedText>
                    </View>

                    <ThemedText style={styles.userName}>{MY_PROFILE.name}</ThemedText>

                    <View style={styles.levelContainer}>
                        <View style={styles.levelInfo}>
                            <ThemedText style={styles.levelText}>Level {MY_PROFILE.level}</ThemedText>
                            <ThemedText style={styles.xpText}>{MY_PROFILE.xp} Xp</ThemedText>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '60%' }]} />
                        </View>
                    </View>
                </View>

                {/* Plants Grid */}
                <View style={styles.plantsGrid}>
                    {MY_PROFILE.plants.map((plant) => (
                        <View key={plant.id} style={styles.plantCard}>
                            <Image source={plant.image} style={styles.plantImage} contentFit="cover" />
                            <View style={styles.plantNameOverlay}>
                                <ThemedText style={styles.plantName}>{plant.name}</ThemedText>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#A5D6A7', // Light green background like in design
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D5F3F',
    },
    settingsButton: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 30,
        position: 'relative',
    },
    avatarWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
        marginBottom: 15,
        position: 'relative',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4CAF50',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    likeContainer: {
        position: 'absolute',
        right: 40,
        top: 60,
        alignItems: 'center',
    },
    likeIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    likeCount: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    levelContainer: {
        width: '100%',
    },
    levelInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    levelText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    xpText: {
        fontSize: 14,
        color: '#E8F5E9',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    plantsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        gap: 15,
    },
    plantCard: {
        width: (width - 45) / 2,
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 4,
        borderColor: '#81C784',
    },
    plantImage: {
        width: '100%',
        height: '100%',
    },
    plantNameOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
    },
    plantName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

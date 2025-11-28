import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Dummy recommended plants for Bojongsoang, Bandung area
// Climate: Tropical highland (700m altitude), 20-28°C, moderate-high rainfall
const RECOMMENDED_PLANTS = [
    {
        id: 1,
        name: 'Kangkung',
        difficulty: 'Pemula',
        growthTime: '25-30 hari',
        description: 'Cocok untuk iklim Bojongsoang, tumbuh cepat di tanah lembab',
        icon: 'leaf' as const,
        color: '#4CAF50',
    },
    {
        id: 2,
        name: 'Cabai Rawit',
        difficulty: 'Menengah',
        growthTime: '75-90 hari',
        description: 'Sangat cocok di dataran rendah Bojongsoang dengan curah hujan sedang',
        icon: 'flame' as const,
        color: '#F44336',
    },
    {
        id: 3,
        name: 'Tomat Cherry',
        difficulty: 'Menengah',
        growthTime: '60-80 hari',
        description: 'Tumbuh optimal di suhu 20-28°C, ideal untuk Bojongsoang',
        icon: 'nutrition' as const,
        color: '#FF5722',
    },
    {
        id: 4,
        name: 'Sawi Hijau',
        difficulty: 'Pemula',
        growthTime: '30-40 hari',
        description: 'Sayuran favorit yang mudah tumbuh di tanah subur Bojongsoang',
        icon: 'leaf-outline' as const,
        color: '#66BB6A',
    },
    {
        id: 5,
        name: 'Bayam Merah',
        difficulty: 'Pemula',
        growthTime: '25-35 hari',
        description: 'Pertumbuhan cepat, cocok untuk pemula di area Bojongsoang',
        icon: 'restaurant' as const,
        color: '#E91E63',
    },
    {
        id: 6,
        name: 'Terong Ungu',
        difficulty: 'Menengah',
        growthTime: '70-90 hari',
        description: 'Produktif di dataran rendah dengan kelembaban tinggi seperti Bojongsoang',
        icon: 'egg' as const,
        color: '#9C27B0',
    },
    {
        id: 7,
        name: 'Bawang Daun',
        difficulty: 'Pemula',
        growthTime: '60-70 hari',
        description: 'Tahan terhadap curah hujan tinggi, cocok untuk musim hujan Bojongsoang',
        icon: 'ellipse' as const,
        color: '#8BC34A',
    },
    {
        id: 8,
        name: 'Kemangi',
        difficulty: 'Pemula',
        growthTime: '30-45 hari',
        description: 'Herba aromatik yang mudah tumbuh di iklim tropis Bandung',
        icon: 'flower' as const,
        color: '#4CAF50',
    },
];

export default function PlantRecommendationResultScreen() {
    const [selectedPlant, setSelectedPlant] = useState<number | null>(null);

    const handlePlantSelect = (plantId: number) => {
        setSelectedPlant(plantId);
        // Navigate to plant detail
        router.push(`/plant-detail?id=${plantId}`);
    };

    // Get hero plant (first recommendation)
    const heroPlant = RECOMMENDED_PLANTS[0];

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#2D5F3F" />
                </Pressable>
                <ThemedText style={styles.headerTitle}>Rekomendasi Tanaman</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Card with Icon */}
                <Pressable
                    style={styles.heroCard}
                    onPress={() => handlePlantSelect(heroPlant.id)}
                >
                    <View style={[styles.heroIconContainer, { backgroundColor: heroPlant.color }]}>
                        <Ionicons name={heroPlant.icon} size={80} color="#fff" />
                    </View>
                    <View style={styles.heroContent}>
                        <ThemedText style={styles.heroTitle}>{heroPlant.name}</ThemedText>
                        <ThemedText style={styles.heroSubtitle}>
                            🌱 Paling cocok untuk Bojongsoang
                        </ThemedText>
                        <ThemedText style={styles.heroDescription}>
                            {heroPlant.description}
                        </ThemedText>
                        <View style={styles.heroFooter}>
                            <View style={styles.heroBadge}>
                                <Ionicons name="time-outline" size={14} color="#4CAF50" />
                                <ThemedText style={styles.heroBadgeText}>{heroPlant.growthTime}</ThemedText>
                            </View>
                            <View style={styles.heroBadge}>
                                <Ionicons name="bar-chart-outline" size={14} color="#4CAF50" />
                                <ThemedText style={styles.heroBadgeText}>{heroPlant.difficulty}</ThemedText>
                            </View>
                        </View>
                    </View>
                </Pressable>

                {/* Section Title */}
                <ThemedText style={styles.sectionTitle}>Rekomendasi Lainnya</ThemedText>

                {/* Plant Grid */}
                <View style={styles.plantGrid}>
                    {RECOMMENDED_PLANTS.slice(1).map((plant) => (
                        <Pressable
                            key={plant.id}
                            style={styles.plantCard}
                            onPress={() => handlePlantSelect(plant.id)}
                        >
                            <View style={[styles.plantIconContainer, { backgroundColor: plant.color + '20' }]}>
                                <Ionicons name={plant.icon} size={40} color={plant.color} />
                            </View>
                            <ThemedText style={styles.plantName}>{plant.name}</ThemedText>
                            <ThemedText style={styles.plantDifficulty}>{plant.difficulty}</ThemedText>
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F9F4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D5F3F',
    },
    scrollContent: {
        padding: 20,
    },
    heroCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    heroIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    heroContent: {
        gap: 10,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2D5F3F',
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: 5,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#4CAF50',
        textAlign: 'center',
        fontWeight: '600',
    },
    heroDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 5,
    },
    heroFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginTop: 15,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    heroBadgeText: {
        fontSize: 12,
        color: '#2D5F3F',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2D5F3F',
        marginBottom: 15,
    },
    plantGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    plantCard: {
        width: (width - 55) / 2,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    plantIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    plantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D5F3F',
        textAlign: 'center',
    },
    plantDifficulty: {
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
    },
});

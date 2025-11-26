import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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

// Dummy recommended plants
const RECOMMENDED_PLANTS = [
    { id: 1, name: 'Kentang', difficulty: 'Pemula', image: require('@/assets/images/homepage-1.png') },
    { id: 2, name: 'Tomat', difficulty: 'Pemula', image: require('@/assets/images/homepage-2.png') },
    { id: 3, name: 'Cabai', difficulty: 'Menengah', image: require('@/assets/images/homepage-3.png') },
    { id: 4, name: 'Selada', difficulty: 'Pemula', image: require('@/assets/images/homepage-1.png') },
    { id: 5, name: 'Bayam', difficulty: 'Pemula', image: require('@/assets/images/homepage-2.png') },
    { id: 6, name: 'Wortel', difficulty: 'Menengah', image: require('@/assets/images/homepage-3.png') },
];

export default function PlantRecommendationResultScreen() {
    const [selectedPlant, setSelectedPlant] = useState<number | null>(null);

    const handlePlantSelect = (plantId: number) => {
        setSelectedPlant(plantId);
        // Navigate to plant detail
        router.push(`/plant-detail?id=${plantId}`);
    };

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
                {/* Hero Card */}
                <View style={styles.heroCard}>
                    <Image
                        source={require('@/assets/images/homepage-1.png')}
                        style={styles.heroImage}
                        contentFit="cover"
                    />
                    <View style={styles.heroOverlay}>
                        <ThemedText style={styles.heroTitle}>Kentang</ThemedText>
                        <Pressable style={styles.heroButton}>
                            <ThemedText style={styles.heroButtonText}>Lihat</ThemedText>
                        </Pressable>
                    </View>
                </View>

                {/* Section Title */}
                <ThemedText style={styles.sectionTitle}>Rekomendasi Lainnya</ThemedText>

                {/* Plant Grid */}
                <View style={styles.plantGrid}>
                    {RECOMMENDED_PLANTS.map((plant) => (
                        <Pressable
                            key={plant.id}
                            style={styles.plantCard}
                            onPress={() => handlePlantSelect(plant.id)}
                        >
                            <View style={styles.plantIconContainer}>
                                <Ionicons name="leaf" size={40} color="#4CAF50" />
                            </View>
                            <ThemedText style={styles.plantName}>{plant.name}</ThemedText>
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
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 25,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    heroButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    heroButtonText: {
        color: '#4CAF50',
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
        gap: 15,
        borderWidth: 2,
        borderColor: '#E8F5E9',
    },
    plantIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    plantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D5F3F',
        textAlign: 'center',
    },
});

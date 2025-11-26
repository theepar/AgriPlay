import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Dummy data tanaman yang sedang dikerjakan
const DUMMY_PLANTS = [
    {
        id: 1,
        name: 'Kentang',
        startDate: '9 Oktober 2025',
        progress: 65,
        reminder: true,
    },
    {
        id: 2,
        name: 'Tomat',
        startDate: '15 Oktober 2025',
        progress: 45,
        reminder: true,
    },
    {
        id: 3,
        name: 'Cabai',
        startDate: '20 Oktober 2025',
        progress: 30,
        reminder: false,
    },
];

export default function HomeScreen() {
    const [myPlants, setMyPlants] = useState(DUMMY_PLANTS);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('hasSeenOnboarding');
        router.replace('/onboarding');
    };

    const handlePlantDetail = (plantId: number) => {
        console.log('View plant detail:', plantId);
        router.push(`/plant-detail?id=${plantId}`);
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        source={require('@/assets/images/logo-home.png')}
                        style={styles.logo}
                        contentFit="contain"
                    />
                    <View style={styles.headerIcons}>
                        <Pressable style={styles.iconButton}>
                            <Ionicons name="calendar-outline" size={24} color="#2D5F3F" />
                        </Pressable>
                        <Pressable style={styles.iconButton}>
                            <Ionicons name="person-outline" size={24} color="#2D5F3F" />
                        </Pressable>
                    </View>
                </View>

                {/* List Tanaman - Only show if there are plants */}
                {myPlants.length > 0 && (
                    <View style={styles.plantsSection}>
                        <ThemedText style={styles.sectionTitle}>List Tanaman</ThemedText>

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.plantsScroll}
                        >
                            {myPlants.map((plant) => (
                                <View key={plant.id} style={styles.plantCard}>
                                    <View style={styles.plantHeader}>
                                        <ThemedText style={styles.plantName}>{plant.name}</ThemedText>
                                        <ThemedText style={styles.plantDate}>
                                            Mulai sejak {plant.startDate}
                                        </ThemedText>
                                    </View>

                                    <View style={styles.plantFooter}>
                                        <View style={styles.reminderContainer}>
                                            {plant.reminder && (
                                                <>
                                                    <Ionicons name="notifications" size={16} color="#fff" />
                                                    <ThemedText style={styles.reminderText}>
                                                        Siren tanaman
                                                    </ThemedText>
                                                </>
                                            )}
                                        </View>
                                        <Pressable
                                            style={styles.viewButton}
                                            onPress={() => handlePlantDetail(plant.id)}
                                        >
                                            <ThemedText style={styles.viewButtonText}>Lihat</ThemedText>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Menu Grid 2x2 */}
                <View style={styles.menuGrid}>
                    {/* Rekomendasi Tanaman */}
                    <Pressable
                        style={[styles.menuCard, styles.menuCardGreen]}
                        onPress={() => router.push('/plant-recommendation')}
                    >
                        <View style={[styles.menuIconContainer, styles.menuIconGreen]}>
                            <Ionicons name="leaf" size={40} color="#4CAF50" />
                        </View>
                        <ThemedText style={[styles.menuText, styles.menuTextGreen]}>
                            Rekomendasi{'\n'}Tanaman
                        </ThemedText>
                    </Pressable>

                    {/* Misi */}
                    <Pressable style={[styles.menuCard, styles.menuCardRed]}>
                        <View style={[styles.menuIconContainer, styles.menuIconRed]}>
                            <Ionicons name="trophy" size={40} color="#F44336" />
                        </View>
                        <ThemedText style={[styles.menuText, styles.menuTextRed]}>
                            Misi
                        </ThemedText>
                    </Pressable>

                    {/* Virtual Garden */}
                    <Pressable style={[styles.menuCard, styles.menuCardYellow]}>
                        <View style={[styles.menuIconContainer, styles.menuIconYellow]}>
                            <Ionicons name="flower" size={40} color="#FFC107" />
                        </View>
                        <ThemedText style={[styles.menuText, styles.menuTextYellow]}>
                            Virtual{'\n'}Garden
                        </ThemedText>
                    </Pressable>

                    {/* AgriAI */}
                    <Pressable style={[styles.menuCard, styles.menuCardGray]}>
                        <View style={[styles.menuIconContainer, styles.menuIconGray]}>
                            <Ionicons name="bulb" size={40} color="#9E9E9E" />
                        </View>
                        <ThemedText style={[styles.menuText, styles.menuTextGray]}>
                            AgriAI
                        </ThemedText>
                    </Pressable>
                </View>

                {/* Debug: Reset Button */}
                <Pressable style={styles.debugButton} onPress={handleLogout}>
                    <ThemedText style={styles.debugButtonText}>
                        🔄 Reset (Dev Only)
                    </ThemedText>
                </Pressable>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F9F4',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    logo: {
        width: 120,
        height: 50,
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 15,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9F4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    plantsSection: {
        marginTop: 20,
        paddingLeft: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2D5F3F',
        marginBottom: 15,
    },
    plantsScroll: {
        paddingRight: 20,
        gap: 15,
    },
    plantCard: {
        width: width * 0.75,
        backgroundColor: '#4CAF50',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    plantHeader: {
        marginBottom: 30,
    },
    plantName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    plantDate: {
        fontSize: 14,
        color: '#E8F5E9',
    },
    plantFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reminderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    reminderText: {
        fontSize: 13,
        color: '#fff',
    },
    viewButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewButtonText: {
        color: '#4CAF50',
        fontWeight: '600',
        fontSize: 14,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        marginTop: 30,
        gap: 15,
    },
    menuCard: {
        width: (width - 55) / 2,
        aspectRatio: 1,
        borderRadius: 20,
        padding: 20,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    menuCardGreen: {
        backgroundColor: '#E8F5E9',
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    menuCardRed: {
        backgroundColor: '#FFEBEE',
        borderWidth: 2,
        borderColor: '#F44336',
    },
    menuCardYellow: {
        backgroundColor: '#FFF9E6',
        borderWidth: 2,
        borderColor: '#FFC107',
    },
    menuCardGray: {
        backgroundColor: '#F5F5F5',
        borderWidth: 2,
        borderColor: '#9E9E9E',
    },
    menuIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIconGreen: {
        backgroundColor: '#C8E6C9',
    },
    menuIconRed: {
        backgroundColor: '#FFCDD2',
    },
    menuIconYellow: {
        backgroundColor: '#FFECB3',
    },
    menuIconGray: {
        backgroundColor: '#E0E0E0',
    },
    menuText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    menuTextGreen: {
        color: '#2D5F3F',
    },
    menuTextRed: {
        color: '#C62828',
    },
    menuTextYellow: {
        color: '#F57F17',
    },
    menuTextGray: {
        color: '#616161',
    },
    debugButton: {
        marginTop: 30,
        marginHorizontal: 20,
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    debugButtonText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 13,
    },
});

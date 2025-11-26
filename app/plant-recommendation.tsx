import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

type ExperienceLevel = 'pemula' | 'menengah' | 'mahir' | null;
type SunCondition = 'full' | 'partial' | 'shade' | null;

export default function PlantRecommendationScreen() {
    const [step, setStep] = useState(1);
    const [experience, setExperience] = useState<ExperienceLevel>(null);
    const [location, setLocation] = useState('');
    const [area, setArea] = useState('');
    const [sunCondition, setSunCondition] = useState<SunCondition>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const handleGetLocation = async () => {
        setLoadingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Izin lokasi ditolak');
                setLoadingLocation(false);
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = currentLocation.coords;

            // Reverse geocoding to get address
            const address = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (address[0]) {
                const place = `${address[0].street || ''} ${address[0].city || ''}, ${address[0].region || ''}`;
                setLocation(place.trim());
            }
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Gagal mendapatkan lokasi');
        }
        setLoadingLocation(false);
    };

    const handleNext = () => {
        if (step === 1 && !experience) {
            alert('Pilih tingkat pengalaman Anda');
            return;
        }
        if (step === 2 && !location) {
            alert('Masukkan lokasi Anda');
            return;
        }
        if (step === 3 && !sunCondition) {
            alert('Pilih kondisi matahari');
            return;
        }

        if (step < 4) {
            setStep(step + 1);
        } else {
            // Navigate to results
            router.push('/plant-recommendations-result');
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => step === 1 ? router.back() : setStep(step - 1)}>
                    <Ionicons name="arrow-back" size={24} color="#2D5F3F" />
                </Pressable>
                <ThemedText style={styles.headerTitle}>Rekomendasi Tanaman</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Step 1: Experience Level */}
                {step === 1 && (
                    <View style={styles.stepContent}>
                        <ThemedText style={styles.question}>
                            Seberapa berpengalaman kamu dalam berkebun?
                        </ThemedText>

                        <Pressable
                            style={[
                                styles.optionCard,
                                experience === 'pemula' && styles.optionCardSelected,
                            ]}
                            onPress={() => setExperience('pemula')}
                        >
                            <Ionicons
                                name={experience === 'pemula' ? 'radio-button-on' : 'radio-button-off'}
                                size={24}
                                color="#4CAF50"
                            />
                            <ThemedText style={styles.optionText}>Pemula</ThemedText>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.optionCard,
                                experience === 'menengah' && styles.optionCardSelected,
                            ]}
                            onPress={() => setExperience('menengah')}
                        >
                            <Ionicons
                                name={experience === 'menengah' ? 'radio-button-on' : 'radio-button-off'}
                                size={24}
                                color="#4CAF50"
                            />
                            <ThemedText style={styles.optionText}>Menengah</ThemedText>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.optionCard,
                                experience === 'mahir' && styles.optionCardSelected,
                            ]}
                            onPress={() => setExperience('mahir')}
                        >
                            <Ionicons
                                name={experience === 'mahir' ? 'radio-button-on' : 'radio-button-off'}
                                size={24}
                                color="#4CAF50"
                            />
                            <ThemedText style={styles.optionText}>Mahir</ThemedText>
                        </Pressable>
                    </View>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                    <View style={styles.stepContent}>
                        <ThemedText style={styles.question}>
                            Kamu mau bertanam di mana?
                        </ThemedText>

                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Cari lokasi..."
                                placeholderTextColor="#999"
                                value={location}
                                onChangeText={setLocation}
                            />
                            <TextInput
                                style={[styles.input, styles.inputSmall]}
                                placeholder="Luas (m2)"
                                placeholderTextColor="#999"
                                value={area}
                                onChangeText={setArea}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Map Placeholder */}
                        <View style={styles.mapContainer}>
                            <Ionicons name="map" size={80} color="#ccc" />
                            <ThemedText style={styles.mapText}>
                                {location || 'Jalan Telekomunikasi No. 123'}
                            </ThemedText>
                        </View>

                        <Pressable
                            style={styles.gpsButton}
                            onPress={handleGetLocation}
                            disabled={loadingLocation}
                        >
                            <Ionicons name="locate" size={20} color="#4CAF50" />
                            <ThemedText style={styles.gpsButtonText}>
                                {loadingLocation ? 'Mengambil lokasi...' : 'Gunakan GPS Saya'}
                            </ThemedText>
                        </Pressable>
                    </View>
                )}

                {/* Step 3: Sun Condition */}
                {step === 3 && (
                    <View style={styles.stepContent}>
                        <ThemedText style={styles.question}>
                            Bagaimana kondisi matahari di sana?
                        </ThemedText>

                        <Pressable
                            style={[
                                styles.optionCard,
                                sunCondition === 'full' && styles.optionCardSelected,
                            ]}
                            onPress={() => setSunCondition('full')}
                        >
                            <Ionicons
                                name={sunCondition === 'full' ? 'radio-button-on' : 'radio-button-off'}
                                size={24}
                                color="#4CAF50"
                            />
                            <View style={styles.optionContent}>
                                <ThemedText style={styles.optionTextBold}>
                                    ☀️ Sinar Penuh: 6 jam atau lebih
                                </ThemedText>
                            </View>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.optionCard,
                                sunCondition === 'partial' && styles.optionCardSelected,
                            ]}
                            onPress={() => setSunCondition('partial')}
                        >
                            <Ionicons
                                name={sunCondition === 'partial' ? 'radio-button-on' : 'radio-button-off'}
                                size={24}
                                color="#4CAF50"
                            />
                            <View style={styles.optionContent}>
                                <ThemedText style={styles.optionTextBold}>
                                    ⛅ Sebagian Teduh: 3 - 6 jam
                                </ThemedText>
                            </View>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.optionCard,
                                sunCondition === 'shade' && styles.optionCardSelected,
                            ]}
                            onPress={() => setSunCondition('shade')}
                        >
                            <Ionicons
                                name={sunCondition === 'shade' ? 'radio-button-on' : 'radio-button-off'}
                                size={24}
                                color="#4CAF50"
                            />
                            <View style={styles.optionContent}>
                                <ThemedText style={styles.optionTextBold}>
                                    🌥️ Teduh: Kurang dari 3 jam
                                </ThemedText>
                            </View>
                        </Pressable>
                    </View>
                )}
            </ScrollView>

            {/* Next Button */}
            <View style={styles.footer}>
                <Pressable style={styles.nextButton} onPress={handleNext}>
                    <ThemedText style={styles.nextButtonText}>
                        {step === 3 ? 'Selanjutnya' : 'Selanjutnya'}
                    </ThemedText>
                </Pressable>
            </View>
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
    stepContent: {
        gap: 15,
    },
    question: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 20,
        lineHeight: 32,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E8F5E9',
        gap: 15,
    },
    optionCardSelected: {
        borderColor: '#4CAF50',
        backgroundColor: '#E8F5E9',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    optionContent: {
        flex: 1,
    },
    optionTextBold: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    inputSmall: {
        flex: 0.4,
    },
    mapContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    mapText: {
        marginTop: 15,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        gap: 10,
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    gpsButtonText: {
        fontSize: 16,
        color: '#4CAF50',
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    nextButton: {
        backgroundColor: '#FDE8E8',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F44336',
    },
});

import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

// --- TYPES ---
type ExperienceLevel = 'pemula' | 'menengah' | 'mahir' | null;
type SunCondition = 'full' | 'partial' | 'shade' | null;

const { width } = Dimensions.get('window');

export default function PlantRecommendationScreen() {
    // --- STATE ---
    const [step, setStep] = useState(1);
    const [experience, setExperience] = useState<ExperienceLevel>(null);
    const [location, setLocation] = useState('');
    const [area, setArea] = useState('');
    const [sunCondition, setSunCondition] = useState<SunCondition>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [coordinates, setCoordinates] = useState({
        latitude: -7.0051,
        longitude: 107.6419
    });

    // --- LOGIC ---
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

            setCoordinates({ latitude, longitude });

            const address = await Location.reverseGeocodeAsync({ latitude, longitude });
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
        if (step === 1 && !experience) return;
        if (step === 2 && !location) return;
        if (step === 3 && !sunCondition) return;

        if (step === 3) {
            router.push('/plant-recommendations-result');
        } else {
            setStep(step + 1);
        }
    };

    const isStepValid = () => {
        if (step === 1) return !!experience;
        if (step === 2) return !!location;
        if (step === 3) return !!sunCondition;
        return false;
    };

    // --- RENDER COMPONENT ---
    const renderProgressBar = () => {
        const progress = (step / 3) * 100;
        return (
            <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <ThemedText style={styles.stepText}>Langkah {step} dari 3</ThemedText>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 1. Header Simple */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(step - 1)} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Rekomendasi Tanaman</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            {/* Progress Bar */}
            {renderProgressBar()}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* STEP 1: Experience */}
                    {step === 1 && (
                        <View style={styles.stepContainer}>
                            <ThemedText type="title" style={styles.questionTitle}>Seberapa berpengalaman kamu?</ThemedText>
                            <ThemedText style={styles.questionSubtitle}>Kami akan sesuaikan tingkat kesulitan tanaman.</ThemedText>

                            <View style={styles.cardList}>
                                {[
                                    { id: 'pemula', label: 'Pemula', icon: 'leaf-outline', sub: 'Baru mulai belajar' },
                                    { id: 'menengah', label: 'Menengah', icon: 'flower-outline', sub: 'Sudah pernah panen' },
                                    { id: 'mahir', label: 'Mahir', icon: 'ribbon-outline', sub: 'Expert perkebunan' },
                                ].map((item) => (
                                    <Pressable
                                        key={item.id}
                                        style={[
                                            styles.selectionCard,
                                            experience === item.id && styles.selectionCardActive
                                        ]}
                                        onPress={() => setExperience(item.id as ExperienceLevel)}
                                    >
                                        <View style={[styles.iconContainer, experience === item.id && styles.iconContainerActive]}>
                                            <Ionicons name={item.icon as any} size={24} color={experience === item.id ? '#059669' : '#9CA3AF'} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <ThemedText type="defaultSemiBold" style={[styles.cardTitle, experience === item.id && styles.textActive]}>{item.label}</ThemedText>
                                            <ThemedText style={styles.cardSubtitle}>{item.sub}</ThemedText>
                                        </View>
                                        <View style={[styles.radioOuter, experience === item.id && styles.radioOuterActive]}>
                                            {experience === item.id && <View style={styles.radioInner} />}
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* STEP 2: Location */}
                    {step === 2 && (
                        <View style={styles.stepContainer}>
                            <ThemedText type="title" style={styles.questionTitle}>Di mana lokasi lahanmu?</ThemedText>
                            <ThemedText style={styles.questionSubtitle}>Untuk analisis cuaca dan ketinggian.</ThemedText>

                            <View style={styles.inputGroup}>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="location-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Cari lokasi..."
                                        placeholderTextColor="#9CA3AF"
                                        value={location}
                                        onChangeText={setLocation}
                                    />
                                </View>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="resize-outline" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Luas lahan (m²)"
                                        placeholderTextColor="#9CA3AF"
                                        value={area}
                                        onChangeText={setArea}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <View style={styles.mapCard}>
                                <WebView
                                    style={styles.mapWebView}
                                    source={{
                                        html: `
                      <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>body, html, #map { width: 100%; height: 100%; margin: 0; }</style></head><body><div id="map"></div><script>var map = L.map('map', {zoomControl: false}).setView([${coordinates.latitude}, ${coordinates.longitude}], 15);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19}).addTo(map);var marker = L.marker([${coordinates.latitude}, ${coordinates.longitude}], {draggable: true}).addTo(map);marker.on('dragend', function(e) {var pos = marker.getLatLng();window.ReactNativeWebView.postMessage(JSON.stringify({latitude: pos.lat, longitude: pos.lng}));});map.on('click', function(e) {marker.setLatLng(e.latlng);window.ReactNativeWebView.postMessage(JSON.stringify({latitude: e.latlng.lat, longitude: e.latlng.lng}));});</script></body></html>
                    `
                                    }}
                                    onMessage={(event) => {
                                        try {
                                            const data = JSON.parse(event.nativeEvent.data);
                                            setCoordinates({ latitude: data.latitude, longitude: data.longitude });
                                        } catch (e) { }
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.gpsButton}
                                    onPress={handleGetLocation}
                                    disabled={loadingLocation}
                                >
                                    {loadingLocation ? (
                                        <ActivityIndicator size="small" color="#059669" />
                                    ) : (
                                        <>
                                            <Ionicons name="locate" size={18} color="#059669" />
                                            <ThemedText style={styles.gpsText}>Gunakan GPS</ThemedText>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* STEP 3: Sun Condition */}
                    {step === 3 && (
                        <View style={styles.stepContainer}>
                            <ThemedText type="title" style={styles.questionTitle}>Kondisi Matahari?</ThemedText>
                            <ThemedText style={styles.questionSubtitle}>Penting untuk fotosintesis tanaman.</ThemedText>

                            <View style={styles.cardList}>
                                {[
                                    { id: 'full', label: 'Sinar Penuh', icon: 'sunny', sub: '> 6 jam sinar langsung' },
                                    { id: 'partial', label: 'Sebagian Teduh', icon: 'partly-sunny', sub: '3 - 6 jam sinar' },
                                    { id: 'shade', label: 'Teduh', icon: 'cloudy', sub: '< 3 jam sinar' },
                                ].map((item) => (
                                    <Pressable
                                        key={item.id}
                                        style={[
                                            styles.selectionCard,
                                            sunCondition === item.id && styles.selectionCardActive
                                        ]}
                                        onPress={() => setSunCondition(item.id as SunCondition)}
                                    >
                                        <View style={[styles.iconContainer, sunCondition === item.id && styles.iconContainerActive]}>
                                            <Ionicons name={item.icon as any} size={24} color={sunCondition === item.id ? '#059669' : '#F59E0B'} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <ThemedText type="defaultSemiBold" style={[styles.cardTitle, sunCondition === item.id && styles.textActive]}>{item.label}</ThemedText>
                                            <ThemedText style={styles.cardSubtitle}>{item.sub}</ThemedText>
                                        </View>
                                        <View style={[styles.radioOuter, sunCondition === item.id && styles.radioOuterActive]}>
                                            {sunCondition === item.id && <View style={styles.radioInner} />}
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={styles.footer}>
                <ThemedButton
                    title={step === 3 ? 'Lihat Hasil' : 'Selanjutnya'}
                    onPress={handleNext}
                    disabled={!isStepValid()}
                    variant="primary"
                    icon={step !== 3 ? <Ionicons name="arrow-forward" size={20} color="#fff" /> : undefined}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Clean White
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    backBtn: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },

    // Progress Bar
    progressContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    progressTrack: {
        height: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 2,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#059669', // Primary Green
        borderRadius: 2,
    },
    stepText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'right',
        fontWeight: '500',
    },

    // Content Area
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    stepContainer: {
        gap: 10,
    },
    questionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    questionSubtitle: {
        fontSize: 15,
        color: '#6B7280',
        marginBottom: 20,
        lineHeight: 22,
    },

    // Card Selection Styles
    cardList: {
        gap: 12,
    },
    selectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB', // Light Border
        gap: 16,
    },
    selectionCardActive: {
        borderColor: '#059669',
        backgroundColor: '#ECFDF5', // Very light green bg
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainerActive: {
        backgroundColor: '#fff',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 2,
    },
    textActive: {
        color: '#059669',
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterActive: {
        borderColor: '#059669',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#059669',
    },

    // Inputs
    inputGroup: {
        gap: 12,
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: '#111827',
    },

    // Map
    mapCard: {
        height: 250,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    mapWebView: {
        flex: 1,
    },
    gpsButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    gpsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    nextButton: {
        backgroundColor: '#059669', // Primary Green
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    nextButtonDisabled: {
        backgroundColor: '#E5E7EB',
        shadowOpacity: 0,
        elevation: 0,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
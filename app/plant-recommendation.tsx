import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { fetchCurrentWeather, type CurrentWeather } from '@/lib/weather';
import { goBack } from '@/lib/navigation';
import { showAlert } from '@/lib/alert';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- TYPES ---
type ExperienceLevel = 'pemula' | 'menengah' | 'mahir' | null;
type SunCondition = 'full' | 'partial' | 'shade' | null;
type Coordinates = { latitude: number; longitude: number };

const DEFAULT_COORDS: Coordinates = { latitude: -7.0051, longitude: 107.6419 };

// HTML peta dibuat sekali. Posisi marker diubah lewat injectJavaScript agar
// WebView tidak reload setiap kali koordinat berubah.
function buildMapHtml({ latitude, longitude }: Coordinates): string {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" /><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" /><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script><style>body, html, #map { width: 100%; height: 100%; margin: 0; }</style></head><body><div id="map"></div><script>
var map = L.map('map', {zoomControl: false}).setView([${latitude}, ${longitude}], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; OpenStreetMap'}).addTo(map);
var marker = L.marker([${latitude}, ${longitude}], {draggable: true}).addTo(map);
function notify(pos) { window.ReactNativeWebView.postMessage(JSON.stringify({latitude: pos.lat, longitude: pos.lng})); }
marker.on('dragend', function() { notify(marker.getLatLng()); });
map.on('click', function(e) { marker.setLatLng(e.latlng); notify(e.latlng); });
window.setMarker = function(lat, lng) { marker.setLatLng([lat, lng]); map.setView([lat, lng], 15); };
</script></body></html>`;
}

function formatAddress(address: Location.LocationGeocodedAddress): string {
    return [address.street, address.city ?? address.subregion, address.region].filter(Boolean).join(', ');
}

// Pesan dari WebView diperlakukan sebagai input tak tepercaya.
function parseMapMessage(data: string): Coordinates | null {
    try {
        const { latitude, longitude } = JSON.parse(data);
        const valid =
            typeof latitude === 'number' && typeof longitude === 'number' &&
            Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
        return valid ? { latitude, longitude } : null;
    } catch {
        return null;
    }
}

function formatCoords({ latitude, longitude }: Coordinates): string {
    return `Titik peta (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
}

export default function PlantRecommendationScreen() {
    const insets = useSafeAreaInsets();
    // --- STATE ---
    const [step, setStep] = useState(1);
    const [experience, setExperience] = useState<ExperienceLevel>(null);
    const [location, setLocation] = useState('');
    const [sunCondition, setSunCondition] = useState<SunCondition>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [searching, setSearching] = useState(false);
    const [weather, setWeather] = useState<CurrentWeather | null>(null);
    const [coordinates, setCoordinates] = useState<Coordinates>(DEFAULT_COORDS);
    // Tombol lanjut aktif hanya jika titik lahan benar-benar dipilih (bukan default).
    const [hasPickedLocation, setHasPickedLocation] = useState(false);
    const [mapHtml] = useState(() => buildMapHtml(DEFAULT_COORDS));
    const webViewRef = useRef<WebView>(null);
    const latestRequest = useRef(0);

    // --- LOGIC ---
    const moveMarker = ({ latitude, longitude }: Coordinates) => {
        webViewRef.current?.injectJavaScript(`window.setMarker(${latitude}, ${longitude}); true;`);
    };

    const applyCoordinates = async (coords: Coordinates, options: { label?: string; moveMarker?: boolean } = {}) => {
        // Respons untuk titik lama (pin digeser cepat) tidak boleh menimpa titik terbaru.
        const request = ++latestRequest.current;
        const isLatest = () => request === latestRequest.current;

        setCoordinates(coords);
        setHasPickedLocation(true);
        setWeather(null);
        if (options.moveMarker) moveMarker(coords);

        fetchCurrentWeather(coords.latitude, coords.longitude)
            .then(result => isLatest() && setWeather(result))
            .catch(() => {});

        if (options.label) {
            setLocation(options.label);
            return;
        }
        let label = formatCoords(coords);
        try {
            // Android butuh izin lokasi untuk geocoding; jangan memunculkan dialog di sini.
            const { granted } = await Location.getForegroundPermissionsAsync();
            const [address] = granted ? await Location.reverseGeocodeAsync(coords) : [];
            if (address) label = formatAddress(address) || label;
        } catch {}
        if (isLatest()) setLocation(label);
    };

    const handleGetLocation = async () => {
        setLoadingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                showAlert('Izin lokasi ditolak', 'Pilih titik lahan langsung di peta atau cari nama lokasi.');
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced, // Faster, ~100m accuracy
            });
            const { latitude, longitude } = currentLocation.coords;
            await applyCoordinates({ latitude, longitude }, { moveMarker: true });
        } catch {
            showAlert('Gagal', 'Gagal mendapatkan data lokasi. Coba pilih titik di peta.');
        } finally {
            setLoadingLocation(false);
        }
    };

    const handleSearch = async () => {
        const query = location.trim();
        if (!query) return;
        setSearching(true);
        try {
            await Location.requestForegroundPermissionsAsync();
            const [result] = await Location.geocodeAsync(query);
            if (!result) {
                showAlert('Lokasi tidak ditemukan', 'Coba nama kota/kecamatan yang lebih spesifik, atau pilih titik di peta.');
                return;
            }
            await applyCoordinates({ latitude: result.latitude, longitude: result.longitude }, { label: query, moveMarker: true });
        } catch {
            showAlert('Pencarian gagal', 'Tidak dapat mencari lokasi. Pilih titik langsung di peta atau gunakan GPS.');
        } finally {
            setSearching(false);
        }
    };

    const isLocationValid = hasPickedLocation && location.trim().length > 0;

    const handleNext = () => {
        if (step === 1 && !experience) return;
        if (step === 2 && !isLocationValid) return;
        if (step === 3 && !sunCondition) return;

        if (step === 3) {
            router.push({
                pathname: '/plant-recommendations-result',
                params: {
                    location: location,
                    experience: experience,
                    sunCondition: sunCondition,
                    latitude: coordinates.latitude.toString(),
                    longitude: coordinates.longitude.toString(),
                }
            });
        } else {
            setStep(step + 1);
        }
    };

    const isStepValid = () => {
        if (step === 1) return !!experience;
        if (step === 2) return isLocationValid;
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
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity hitSlop={4} onPress={() => step === 1 ? goBack() : setStep(step - 1)} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Kembali">
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
                <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]} showsVerticalScrollIndicator={false}>

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
                                        accessibilityRole="radio"
                                        accessibilityState={{ checked: experience === item.id }}
                                    >
                                        <View style={[styles.iconContainer, experience === item.id && styles.iconContainerActive]}>
                                            <Ionicons name={item.icon as any} size={24} color={experience === item.id ? '#047857' : '#9CA3AF'} />
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
                                        placeholder="Cari kota / kecamatan..."
                                        placeholderTextColor="#9CA3AF"
                                        value={location}
                                        onChangeText={setLocation}
                                        onSubmitEditing={handleSearch}
                                        returnKeyType="search"
                                    />
                                    <TouchableOpacity
                                        onPress={handleSearch}
                                        disabled={searching || !location.trim()}
                                        style={styles.searchBtn}
                                        hitSlop={8}
                                        accessibilityRole="button"
                                        accessibilityLabel="Cari lokasi"
                                    >
                                        {searching ? (
                                            <ActivityIndicator size="small" color="#047857" />
                                        ) : (
                                            <Ionicons name="search" size={20} color={location.trim() ? '#047857' : '#D1D5DB'} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {!hasPickedLocation && (
                                    <ThemedText style={styles.hintText}>
                                        Cari lokasi, ketuk peta, atau gunakan GPS untuk menentukan titik lahanmu.
                                    </ThemedText>
                                )}
                            </View>

                            {/* Weather Info Display */}
                            {weather && (
                                <View style={styles.weatherInfo}>
                                    <Ionicons name="cloud-outline" size={20} color="#047857" />
                                    <ThemedText style={styles.weatherText}>
                                        Cuaca saat ini: {weather.description}, {weather.temp}°C
                                    </ThemedText>
                                </View>
                            )}

                            <View style={styles.mapCard}>
                                <WebView
                                    ref={webViewRef}
                                    style={styles.mapWebView}
                                    source={{ html: mapHtml }}
                                    // Peta tidak boleh berpindah halaman; tautan lain (mis. atribusi) dibuka di browser sistem.
                                    originWhitelist={['about:blank']}
                                    setSupportMultipleWindows={false}
                                    // Peta dibuat ulang saat kembali ke langkah ini; pulihkan titik yang dipilih.
                                    onLoadEnd={() => hasPickedLocation && moveMarker(coordinates)}
                                    onMessage={(event) => {
                                        const coords = parseMapMessage(event.nativeEvent.data);
                                        if (coords) applyCoordinates(coords);
                                    }}
                                />
                                <TouchableOpacity hitSlop={4}
                                    style={styles.gpsButton}
                                    onPress={handleGetLocation}
                                    disabled={loadingLocation}
                                    accessibilityRole="button"
                                    accessibilityLabel="Gunakan lokasi GPS saat ini"
                                >
                                    {loadingLocation ? (
                                        <ActivityIndicator size="small" color="#047857" />
                                    ) : (
                                        <>
                                            <Ionicons name="locate" size={18} color="#047857" />
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
                                        accessibilityRole="radio"
                                        accessibilityState={{ checked: sunCondition === item.id }}
                                    >
                                        <View style={[styles.iconContainer, sunCondition === item.id && styles.iconContainerActive]}>
                                            <Ionicons name={item.icon as any} size={24} color={sunCondition === item.id ? '#047857' : '#F59E0B'} />
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
            <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <ThemedButton
                    title={step === 3 ? 'Lihat Hasil' : 'Selanjutnya'}
                    onPress={handleNext}
                    disabled={!isStepValid()}
                    variant="primary"
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
        backgroundColor: '#047857', // Primary Green
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
        borderColor: '#047857',
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
        color: '#047857',
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
        borderColor: '#047857',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#047857',
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
    searchBtn: {
        padding: 6,
        marginLeft: 6,
    },
    hintText: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 19,
    },

    // Weather Info
    weatherInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    weatherText: {
        fontSize: 14,
        color: '#047857',
        fontWeight: '600',
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
        color: '#047857',
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
});
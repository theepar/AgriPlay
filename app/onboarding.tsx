import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    View,
    ViewToken
} from 'react-native';

const { width, height } = Dimensions.get('window');

const onboardingData = [
    {
        id: 1,
        image: require('@/assets/images/logo-home.png'),
        title: 'Selamat Datang',
        description: 'Solusi pertanian cerdas dalam genggaman Anda. Mari mulai perjalanan hijau bersama kami.',
        isLogo: true,
    },
    {
        id: 2,
        image: require('@/assets/images/homepage-1.png'),
        title: 'AI & Machine Learning',
        description: 'Temukan cara bercocok tanam yang lebih cerdas, efisien, dan produktif dengan bantuan teknologi terkini.',
    },
    {
        id: 3,
        image: require('@/assets/images/homepage-2.png'),
        title: 'Rekomendasi Terbaik',
        description: 'Dapatkan panduan langkah demi langkah yang disesuaikan dengan kondisi tanah dan lokasi Anda.',
    },
    {
        id: 4,
        image: require('@/assets/images/homepage-3.png'),
        title: 'Komunitas Petani',
        description: 'Bergabunglah dengan komunitas, bertukar pengalaman, dan wujudkan regenerasi petani Indonesia.',
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems && viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleFinish = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            router.replace('/login');
        } catch (err) {
            console.log('Error @setItem: ', err);
        }
    };

    const scrollTo = async () => {
        if (currentIndex < onboardingData.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            handleFinish();
        }
    };

    const Paginator = ({ data, scrollX }: { data: typeof onboardingData, scrollX: Animated.Value }) => {
        return (
            <View style={styles.pagination}>
                {data.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 24, 8],
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    const backgroundColor = scrollX.interpolate({
                        inputRange,
                        outputRange: ['#D1D5DB', '#059669', '#D1D5DB'],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            style={[
                                styles.dot,
                                {
                                    width: dotWidth,
                                    opacity,
                                    backgroundColor,
                                },
                            ]}
                            key={i.toString()}
                        />
                    );
                })}
            </View>
        );
    };

    const renderItem = ({ item }: { item: typeof onboardingData[0] }) => {
        return (
            <View style={styles.slide}>
                {/* Image Area */}
                <View style={styles.imageContainer}>
                    {item.isLogo ? (
                        <Image
                            source={item.image}
                            style={styles.logoImage}
                            contentFit="contain"
                        />
                    ) : (
                        // Normal Slide Image
                        <Image
                            source={item.image}
                            style={styles.image}
                            contentFit="contain"
                        />
                    )}
                </View>

                {/* Text Area */}
                <View style={styles.textContainer}>
                    <ThemedText style={styles.title}>{item.title}</ThemedText>
                    <ThemedText style={styles.description}>{item.description}</ThemedText>
                </View>
            </View>
        );
    };

    return (
        <ThemedView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Decorative Background (Consistent with Login) */}
            <View style={styles.decorativeCircle} />

            {/* Skip Button */}
            {currentIndex < onboardingData.length - 1 && (
                <Pressable style={styles.skipButton} onPress={handleFinish}>
                    <ThemedText style={styles.skipText}>Lewati</ThemedText>
                </Pressable>
            )}

            {/* Slides */}
            <View style={{ flex: 3 }}>
                <FlatList
                    data={onboardingData}
                    renderItem={renderItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id.toString()}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            {/* Footer Controls */}
            <View style={styles.footer}>
                <Paginator data={onboardingData} scrollX={scrollX} />

                <View style={styles.buttonContainer}>
                    <ThemedButton
                        title={currentIndex === onboardingData.length - 1 ? 'Mulai Sekarang' : 'Selanjutnya'}
                        onPress={scrollTo}
                        style={styles.mainButton}
                    />
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    decorativeCircle: {
        position: 'absolute',
        top: -100,
        right: -80,
        width: 350,
        height: 350,
        borderRadius: 175,
        backgroundColor: '#ECFDF5', // Very light green bg
        zIndex: -1,
    },
    slide: {
        width: width,
        alignItems: 'center',
        paddingHorizontal: 24,
    },

    // Header / Skip
    skipButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 50,
        right: 24,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },

    // Images
    imageContainer: {
        flex: 0.6,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    logoImage: {
        width: 150,
        height: 80,
    },
    image: {
        width: width * 0.85,
        height: '80%',
    },

    // Text Content
    textContainer: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 16,
        color: '#111827', // Dark Grey
        paddingHorizontal: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        color: '#6B7280', // Soft Grey
        paddingHorizontal: 10,
    },

    // Footer & Pagination
    footer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 50 : 30,
        width: '100%',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: 40,
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonContainer: {
        width: '100%',
    },
    mainButton: {
        // Custom style override if needed, otherwise uses ThemedButton default
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
});
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
    Pressable,
    StyleSheet,
    View,
    ViewToken
} from 'react-native';

const { width, height } = Dimensions.get('window');

const onboardingData = [
    {
        id: 1,
        image: require('@/assets/images/logo-home.png'),
        title: '',
        description: '',
        isLogo: true,
    },
    {
        id: 2,
        image: require('@/assets/images/homepage-1.png'),
        title: 'AI & Machine Learning',
        description:
            'Aplikasi mobile berbasis AI dan Machine Learning yang membantu generasi muda mengajar dunia pertanian modern. Temukan cara berccocok tanam cerdas, lebih efisien, dan produktif - langsung dari genggaman!',
    },
    {
        id: 3,
        image: require('@/assets/images/homepage-2.png'),
        title: 'Rekomendasi Terbaik',
        description:
            'Dapatkan rekomendasi langkah tanen terbaik berdasarkan kondisi tanahmu, Video tutorial, panduan interaktif, dan tips harian langsung dari agronomis profesional untuk hasil panen maksimal!',
    },
    {
        id: 4,
        image: require('@/assets/images/homepage-3.png'),
        title: 'Komunitas Petani',
        description:
            'Gabung komunitas pecinta pertanian, bertukur pengalaman, dan ikut tantangan seru! untuk meningkatkan regenerasi petani di Indonesia. Bersama, kita tunjukan masa depan pertanian yang keren!',
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

    const scrollTo = async () => {
        if (currentIndex < onboardingData.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            try {
                await AsyncStorage.setItem('hasSeenOnboarding', 'true');
                router.replace('/login');
            } catch (err) {
                console.log('Error @setItem: ', err);
            }
        }
    };

    const handleSkip = async () => {
        try {
            await AsyncStorage.setItem('hasSeenOnboarding', 'true');
            router.replace('/login');
        } catch (err) {
            console.log('Error @setItem: ', err);
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
                        outputRange: ['#D1D5DB', '#4CAF50', '#D1D5DB'],
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
                {item.isLogo ? (
                    <View style={styles.logoContainer}>
                        <Image source={item.image} style={styles.logoImage} contentFit="contain" />
                    </View>
                ) : (
                    <View style={styles.contentContainer}>
                        <View style={styles.imageContainer}>
                            <Image source={item.image} style={styles.image} contentFit="contain" />
                        </View>
                        <View style={styles.textContainer}>
                            <ThemedText style={styles.title}>{item.title}</ThemedText>
                            <ThemedText style={styles.description}>{item.description}</ThemedText>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ThemedView style={styles.container}>
            {/* Skip Button */}
            {currentIndex > 0 && (
                <Pressable style={styles.skipButton} onPress={handleSkip}>
                    <ThemedText style={styles.skipText}>Lewati</ThemedText>
                </Pressable>
            )}

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

            <View style={styles.footer}>
                <Paginator data={onboardingData} scrollX={scrollX} />

                <Pressable style={styles.button} onPress={scrollTo}>
                    <ThemedText style={styles.buttonText}>
                        {currentIndex === 0
                            ? 'Mulai'
                            : currentIndex === onboardingData.length - 1
                                ? 'Memulai'
                                : 'Selanjutnya'}
                    </ThemedText>
                </Pressable>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    slide: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    skipText: {
        fontSize: 16,
        color: '#666',
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
    },
    logoImage: {
        width: width * 0.6,
        height: height * 0.3,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    imageContainer: {
        width: width * 0.8,
        height: height * 0.4,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#2D5F3F',
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        color: '#555',
        paddingHorizontal: 10,
    },
    footer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 50,
        width: '100%',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        height: 64,
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

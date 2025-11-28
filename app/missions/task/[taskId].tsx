import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function TaskDetailScreen() {
    const { taskId } = useLocalSearchParams();

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#2D5F3F" />
                </Pressable>
                <ThemedText style={styles.headerTitle}>Misi Tanaman</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={styles.title}>Teliti Tanamannya</ThemedText>
                <ThemedText style={styles.status}>Status: Belum dimulai</ThemedText>

                <View style={styles.instructionContainer}>
                    <View style={styles.stepItem}>
                        <ThemedText style={styles.stepTitle}>1. Potato Seeds</ThemedText>
                        <View style={styles.bulletPoint}>
                            <View style={styles.bullet} />
                            <ThemedText style={styles.stepDesc}>
                                Choose varieties suitable for your climate (e.g., Yukon Gold, Red Pontiac, or Granola)
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.stepItem}>
                        <ThemedText style={styles.stepTitle}>2. Containers or Space</ThemedText>
                        <View style={styles.bulletPoint}>
                            <View style={styles.bullet} />
                            <ThemedText style={styles.stepDesc}>
                                Grow bags, buckets, large pots (minimum 10-15 liters), or a small raised bed
                            </ThemedText>
                        </View>
                        <View style={styles.bulletPoint}>
                            <View style={styles.bullet} />
                            <ThemedText style={styles.stepDesc}>
                                Must have drainage holes to prevent rot
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.stepItem}>
                        <ThemedText style={styles.stepTitle}>3. Soil & Compost</ThemedText>
                        <View style={styles.bulletPoint}>
                            <View style={styles.bullet} />
                            <ThemedText style={styles.stepDesc}>
                                Loose, well-draining soil
                            </ThemedText>
                        </View>
                        <View style={styles.bulletPoint}>
                            <View style={styles.bullet} />
                            <ThemedText style={styles.stepDesc}>
                                Enriched with organic compost
                            </ThemedText>
                        </View>
                        <View style={styles.bulletPoint}>
                            <View style={styles.bullet} />
                            <ThemedText style={styles.stepDesc}>
                                Optional: Potato fertilizer or aged manure
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.stepItem}>
                        <ThemedText style={styles.stepTitle}>4. Tools</ThemedText>
                        <View style={styles.bulletPoint}>
                            <View style={styles.bullet} />
                            <ThemedText style={styles.stepDesc}>
                                Small garden trowel
                            </ThemedText>
                        </View>
                        <View style={styles.bulletPoint}>
                            <View style={styles.bullet} />
                            <ThemedText style={styles.stepDesc}>
                                Gloves
                            </ThemedText>
                        </View>
                        <View style={styles.bulletPoint}>
                            <View style={styles.bullet} />
                            <ThemedText style={styles.stepDesc}>
                                Watering can or hose with a gentle spray nozzle
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <ThemedButton
                    title="Mulai Tugas"
                    onPress={() => {
                        // Handle start task
                        console.log('Start task');
                        router.back();
                    }}
                />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2D5F3F',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    title: {
        fontSize: 24,
        marginBottom: 5,
        color: '#000',
    },
    status: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
    },
    instructionContainer: {
        gap: 20,
    },
    stepItem: {
        marginBottom: 10,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    bulletPoint: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
        paddingLeft: 10,
    },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#000',
        marginTop: 8,
        marginRight: 10,
    },
    stepDesc: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
});

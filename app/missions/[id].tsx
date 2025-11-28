import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PLANTS_DATA } from '@/constants/plants';

export default function MissionDetailScreen() {
    const { id } = useLocalSearchParams();

    const plant = PLANTS_DATA.find(p => p.id === id);

    if (!plant) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Plant not found</ThemedText>
            </ThemedView>
        );
    }

    const { name: plantName, description, tasks } = plant;

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
                {/* Banner */}
                <View style={styles.banner}>
                    <Image
                        source={plant.image}
                        style={styles.bannerImage}
                        contentFit="cover"
                    />
                    <View style={styles.bannerOverlay}>
                        <ThemedText style={styles.bannerTitle}>{plantName}</ThemedText>
                        <ThemedText style={styles.bannerDesc} numberOfLines={3}>
                            {description}
                        </ThemedText>
                    </View>
                </View>

                {/* Progress */}
                <View style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <ThemedText style={styles.progressTitle}>Progress</ThemedText>
                        <ThemedText style={styles.progressCount}>0/10</ThemedText>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '0%' }]} />
                    </View>
                    <ThemedText style={styles.progressSubtitle}>Semangat!</ThemedText>
                </View>

                {/* Tasks List */}
                <View style={styles.taskList}>
                    {tasks.map((task, index) => (
                        <Pressable
                            key={task.id}
                            style={styles.taskItem}
                            onPress={() => router.push({ pathname: '/missions/task/[taskId]', params: { taskId: task.id } })}
                            disabled={task.status === 'locked'}
                        >
                            <View style={[
                                styles.taskIcon,
                                task.status === 'active' ? styles.taskIconActive : styles.taskIconLocked
                            ]} />
                            <View style={styles.taskInfo}>
                                <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>
                            </View>
                            <View style={styles.taskRight}>
                                <ThemedText style={styles.xpText}>+{task.xp} xp</ThemedText>
                                <Ionicons name="arrow-forward" size={20} color="#999" />
                            </View>
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
        paddingBottom: 40,
    },
    banner: {
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#000',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
    },
    bannerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    bannerDesc: {
        fontSize: 12,
        color: '#eee',
        lineHeight: 16,
    },
    progressCard: {
        backgroundColor: '#66BB6A',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    progressTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    progressCount: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        marginBottom: 10,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    progressSubtitle: {
        color: '#fff',
        fontSize: 12,
    },
    taskList: {
        gap: 15,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    taskIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 15,
    },
    taskIconActive: {
        backgroundColor: '#D4E157', // Yellow-ish green
    },
    taskIconLocked: {
        backgroundColor: '#E0E0E0',
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    taskRight: {
        alignItems: 'flex-end',
    },
    xpText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
});

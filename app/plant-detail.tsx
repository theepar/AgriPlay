import { NotFoundState } from '@/components/not-found-state';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { getPlantById } from '@/constants/plants';
import { getPlantProgress, useGarden } from '@/lib/garden-store';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import {
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';



export default function PlantDetailScreen() {
    const { id } = useLocalSearchParams();
    const { taskStatus } = useGarden();
    const plant = getPlantById(id);
    if (!plant) {
        return <NotFoundState title="Tanaman tidak ditemukan" message="Data tanaman ini tidak tersedia." />;
    }
    const { percent: progress } = getPlantProgress(plant, taskStatus);

    // Status tugas berasal dari progres misi yang tersimpan (read-only di sini).
    const tasks = plant.tasks.map(t => ({ ...t, status: taskStatus[t.id] ?? t.status }));

    const handleTaskPress = (taskId: string) => {
        router.push({ pathname: '/missions/task/[taskId]', params: { taskId } });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* 1. SIMPLE HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Kembali">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Detail Tanaman</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* 2. IMAGE CARD */}
                <View style={styles.imageCard}>
                    <Image source={{ uri: plant.image }} style={styles.plantImage} contentFit="cover" />
                    <View style={styles.xpBadge}>
                        <Ionicons name="flash" size={14} color="#F59E0B" />
                        <ThemedText style={styles.xpText}>{plant.totalXp} XP</ThemedText>
                    </View>
                </View>

                {/* 3. TITLE & INFO */}
                <View style={styles.infoSection}>
                    <ThemedText type="title" style={styles.plantName}>{plant.name}</ThemedText>
                    <ThemedText style={styles.plantLatin}>{plant.latin}</ThemedText>
                    <ThemedText style={styles.description}>{plant.description}</ThemedText>
                </View>

                {/* 4. SIMPLE PROGRESS */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressLabelRow}>
                        <ThemedText type="defaultSemiBold" style={styles.label}>Progress Misi</ThemedText>
                        <ThemedText style={styles.percent}>{Math.round(progress)}%</ThemedText>
                    </View>
                    <View style={styles.track}>
                        <View style={[styles.fill, { width: `${progress}%` }]} />
                    </View>
                </View>

                {/* 5. CLEAN TASK LIST */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Daftar Tugas</ThemedText>
                <View style={styles.taskList}>
                    {tasks.map((task) => {
                        const completed = task.status === 'completed';
                        const locked = task.status === 'locked';
                        return (
                            <Pressable
                                key={task.id}
                                style={[styles.taskItem, completed && styles.taskItemDone, locked && styles.taskItemLocked]}
                                onPress={() => handleTaskPress(task.id)}
                                disabled={locked}
                            >
                                <View style={[styles.checkbox, completed && styles.checkboxDone]}>
                                    {completed && <Ionicons name="checkmark" size={14} color="#fff" />}
                                    {locked && <Ionicons name="lock-closed" size={12} color="#9CA3AF" />}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="defaultSemiBold" style={[styles.taskTitle, completed && styles.textDone]}>{task.title}</ThemedText>
                                    <ThemedText style={styles.taskXp}>+{task.xp} XP</ThemedText>
                                </View>
                                {task.status === 'active' && <Ionicons name="chevron-forward" size={18} color="#059669" />}
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>

            {/* 6. BOTTOM BUTTON */}
            <View style={styles.footer}>
                <ThemedButton
                    title="Mulai Berkebun"
                    onPress={() => router.push({ pathname: '/missions/[id]', params: { id: plant.id } })}
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
        color: '#1F2937',
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    // Image
    imageCard: {
        height: 220,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 20,
        backgroundColor: '#F3F4F6',
    },
    plantImage: {
        width: '100%',
        height: '100%',
    },
    xpBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    xpText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#F59E0B',
    },
    // Info
    infoSection: {
        marginBottom: 24,
    },
    plantName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    plantLatin: {
        fontSize: 14,
        color: '#4ADE80', // Green accent
        fontWeight: '600',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    description: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
    },
    // Progress
    progressContainer: {
        marginBottom: 24,
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: { fontSize: 14, fontWeight: '600', color: '#374151' },
    percent: { fontSize: 14, fontWeight: '700', color: '#059669' },
    track: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: '#059669', // Solid Green
        borderRadius: 4,
    },
    // Tasks
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    taskList: {
        gap: 12,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
    },
    taskItemDone: {
        backgroundColor: '#F9FAFB',
        borderColor: 'transparent',
    },
    taskItemLocked: {
        opacity: 0.6,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        marginRight: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxDone: {
        backgroundColor: '#059669',
        borderColor: '#059669',
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
    },
    textDone: {
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    taskXp: {
        fontSize: 12,
        color: '#F59E0B',
        marginTop: 2,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    mainButton: {
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
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

// Dummy plant tasks (like Duolingo lessons)
const PLANT_TASKS = [
    { id: 1, title: 'Teliti Tanamannya', completed: false, xp: 100 },
    { id: 2, title: 'Kumpulkan Barang Persiapan', completed: false, xp: 100 },
    { id: 3, title: 'Buat Pot Khusus', completed: false, xp: 100 },
    { id: 4, title: 'Mulai Menanam', completed: false, xp: 100 },
];

export default function PlantDetailScreen() {
    const params = useLocalSearchParams();
    const [tasks, setTasks] = useState(PLANT_TASKS);
    const [progress, setProgress] = useState(0);

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const progressPercentage = (completedTasks / totalTasks) * 100;

    const handleTaskToggle = (taskId: number) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.navigate('/')}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <ThemedText style={styles.headerTitle}>Rekomendasi Tanaman</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Image
                        source={require('@/assets/images/kentang.png')}
                        style={styles.heroImage}
                        contentFit="cover"
                    />
                    <View style={styles.heroOverlay}>
                        <ThemedText style={styles.plantTitle}>Kentang</ThemedText>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.descriptionCard}>
                    <ThemedText style={styles.description}>
                        Kentang (ubi kentang, ubi belanda, atau tata; disebut "Kentang" saja) Kentang adalah tanaman dari suku Solanaceae yang memiliki umbi batang yang dapat dimakan, dan merupakan pangan pokok dari Amerika Selatan. Nama ini dimana berasal dari kata "papa", kata dalam bahasa Amerika Selatan, kekurangan satu atau lain macam siapolysin dipercayakan dari Amerika Selatan.
                    </ThemedText>
                </View>

                {/* Progress Section */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <ThemedText style={styles.progressTitle}>Progress</ThemedText>
                        <ThemedText style={styles.progressCount}>
                            {completedTasks}/{totalTasks}
                        </ThemedText>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                    </View>
                    <ThemedText style={styles.progressLabel}>Satupagi</ThemedText>
                </View>

                {/* Tasks List */}
                <View style={styles.tasksSection}>
                    {tasks.map((task) => (
                        <Pressable
                            key={task.id}
                            style={styles.taskCard}
                            onPress={() => handleTaskToggle(task.id)}
                        >
                            <View style={styles.taskLeft}>
                                <View style={[
                                    styles.taskCheckbox,
                                    task.completed && styles.taskCheckboxCompleted
                                ]}>
                                    {task.completed && (
                                        <Ionicons name="checkmark" size={16} color="#fff" />
                                    )}
                                </View>
                                <ThemedText style={[
                                    styles.taskTitle,
                                    task.completed && styles.taskTitleCompleted
                                ]}>
                                    {task.title}
                                </ThemedText>
                            </View>
                            <ThemedText style={styles.taskXp}>+{task.xp} xp</ThemedText>
                        </Pressable>
                    ))}
                </View>

                {/* Start Button */}
                <View style={{ marginHorizontal: 20, marginTop: 30 }}>
                    <ThemedButton
                        title="Mulai Berkebun"
                        onPress={() => router.push({ pathname: '/missions/[id]', params: { id: '1' } })}
                    />
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
        backgroundColor: '#4CAF50',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    heroSection: {
        height: 200,
        position: 'relative',
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
    },
    plantTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    descriptionCard: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E8F5E9',
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        color: '#666',
    },
    progressSection: {
        backgroundColor: '#4CAF50',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    progressCount: {
        fontSize: 16,
        color: '#fff',
    },
    progressBar: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 6,
    },
    progressLabel: {
        fontSize: 14,
        color: '#E8F5E9',
    },
    tasksSection: {
        paddingHorizontal: 20,
        gap: 12,
    },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    taskLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    taskCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    taskCheckboxCompleted: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    taskTitle: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    taskTitleCompleted: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    taskXp: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
});

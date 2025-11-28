import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { PLANTS_DATA } from '@/constants/plants';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function TaskDetailScreen() {
    const { taskId } = useLocalSearchParams();

    // Find the task across all plants
    const foundTask = PLANTS_DATA.flatMap(p => p.tasks).find(t => t.id === taskId);

    // Default/Fallback data if task not found or for missing fields
    const task = foundTask ? {
        ...foundTask,
        category: 'Perawatan', // Default category
        duration: '15-30 Menit', // Default duration
        description: foundTask.desc, // Map desc to description
        requirements: [
            { id: 1, label: 'Sarung Tangan', icon: 'hand-left' },
            { id: 2, label: 'Sekop Kecil', icon: 'hammer' },
            { id: 3, label: 'Air', icon: 'water' },
        ],
        steps: [
            { id: 1, title: 'Persiapan', desc: 'Siapkan semua alat dan bahan yang dibutuhkan.' },
            { id: 2, title: 'Pelaksanaan', desc: foundTask.desc },
            { id: 3, title: 'Penyelesaian', desc: 'Pastikan area kerja kembali bersih dan rapi.' },
        ]
    } : {
        // Fallback if ID not found
        id: '0',
        title: 'Tugas Tidak Ditemukan',
        category: '-',
        status: 'locked',
        xp: 0,
        duration: '-',
        description: 'Detail tugas tidak tersedia.',
        requirements: [],
        steps: []
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold" style={styles.headerTitle}>Detail Tugas</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. HERO / TITLE SECTION */}
                <View style={styles.heroSection}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="construct" size={32} color="#059669" />
                    </View>
                    <ThemedText type="title" style={styles.taskTitle}>{task.title}</ThemedText>
                    <ThemedText style={styles.taskDesc}>{task.description}</ThemedText>

                    {/* Meta Chips */}
                    <View style={styles.metaRow}>
                        <View style={[styles.chip, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="flash" size={14} color="#059669" />
                            <ThemedText style={[styles.chipText, { color: '#059669' }]}>+{task.xp} XP</ThemedText>
                        </View>
                        <View style={[styles.chip, { backgroundColor: '#F3F4F6' }]}>
                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                            <ThemedText style={[styles.chipText, { color: '#6B7280' }]}>{task.duration}</ThemedText>
                        </View>
                        <View style={[styles.chip, { backgroundColor: '#FFFBEB' }]}>
                            <Ionicons name="pricetag-outline" size={14} color="#D97706" />
                            <ThemedText style={[styles.chipText, { color: '#D97706' }]}>{task.category}</ThemedText>
                        </View>
                    </View>
                </View>

                {/* 2. REQUIREMENTS (Alat & Bahan) */}
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Alat & Bahan</ThemedText>
                </View>

                <View style={styles.reqGrid}>
                    {task.requirements.map((req: any) => (
                        <View key={req.id} style={styles.reqCard}>
                            <View style={styles.reqIconBg}>
                                <Ionicons name={req.icon as any} size={20} color="#059669" />
                            </View>
                            <ThemedText style={styles.reqLabel} numberOfLines={2}>{req.label}</ThemedText>
                        </View>
                    ))}
                </View>

                <View style={styles.divider} />

                {/* 3. STEPS (Instruksi) */}
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Instruksi Pengerjaan</ThemedText>
                    <ThemedText style={styles.stepCount}>{task.steps.length} Langkah</ThemedText>
                </View>

                <View style={styles.stepsContainer}>
                    {/* Garis Vertikal Sambung */}
                    <View style={styles.connectorLine} />

                    {task.steps.map((step: any, index: number) => {
                        const isLast = index === task.steps.length - 1;
                        return (
                            <View key={step.id} style={[styles.stepRow, isLast && { marginBottom: 0 }]}>
                                {/* Left: Number Bubble */}
                                <View style={styles.numberColumn}>
                                    <View style={styles.numberBubble}>
                                        <ThemedText style={styles.numberText}>{index + 1}</ThemedText>
                                    </View>
                                </View>

                                {/* Right: Content */}
                                <View style={styles.stepCard}>
                                    <ThemedText type="defaultSemiBold" style={styles.stepTitle}>{step.title}</ThemedText>
                                    <ThemedText style={styles.stepDesc}>{step.desc}</ThemedText>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FOOTER ACTION */}
            <View style={styles.footer}>
                <ThemedButton
                    title="Tandai Selesai"
                    variant="primary"
                    onPress={() => {
                        console.log("Task Completed");
                        router.back();
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Light Theme
    },

    // HEADER
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        backgroundColor: '#F9FAFB',
        zIndex: 10,
    },
    navBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 16, fontWeight: '700', color: '#111827',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    // HERO SECTION
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconCircle: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: '#ECFDF5',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1, borderColor: '#D1FAE5',
    },
    taskTitle: {
        fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center',
    },
    taskDesc: {
        fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 20,
    },
    metaRow: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8,
    },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    chipText: {
        fontSize: 12, fontWeight: '600',
    },

    // REQ GRID
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '700', color: '#111827',
    },
    stepCount: {
        fontSize: 13, fontWeight: '600', color: '#9CA3AF',
    },
    reqGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    },
    reqCard: {
        width: (width - 48 - 12) / 2, // 2 Column
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 16,
        flexDirection: 'row', alignItems: 'center', gap: 10,
        borderWidth: 1, borderColor: '#E5E7EB',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
    },
    reqIconBg: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6',
        alignItems: 'center', justifyContent: 'center',
    },
    reqLabel: {
        fontSize: 12, fontWeight: '600', color: '#374151', flex: 1,
    },

    divider: {
        height: 1, backgroundColor: '#E5E7EB', marginVertical: 32,
    },

    // STEPS
    stepsContainer: {
        position: 'relative',
    },
    connectorLine: {
        position: 'absolute',
        left: 15, // Center of bubble (32px / 2 - line width / 2)
        top: 20,
        bottom: 20,
        width: 2,
        backgroundColor: '#E5E7EB',
        zIndex: 0,
    },
    stepRow: {
        flexDirection: 'row', marginBottom: 24,
    },
    numberColumn: {
        marginRight: 16, alignItems: 'center',
    },
    numberBubble: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#059669',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 1,
        borderWidth: 3, borderColor: '#F9FAFB', // Ring effect
        shadowColor: '#059669', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 },
    },
    numberText: {
        color: '#FFF', fontWeight: 'bold', fontSize: 12,
    },
    stepCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: '#E5E7EB',
    },
    stepTitle: {
        fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13, color: '#6B7280', lineHeight: 20,
    },

    // FOOTER
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FFFFFF',
        padding: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopWidth: 1, borderTopColor: '#F3F4F6',
    },
    actionButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    gradientBtn: {
        paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    btnText: {
        color: '#FFF', fontSize: 16, fontWeight: 'bold',
    },
});
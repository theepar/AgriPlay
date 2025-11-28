import { ThemedText } from '@/components/themed-text';
import { PLANTS_DATA } from '@/constants/plants';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';



export default function MissionDetailScreen() {
    const { id } = useLocalSearchParams();

    const plantData = PLANTS_DATA.find(p => p.id === id);
    const plant = plantData || PLANTS_DATA[0];

    if (!plant) return null;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <View style={styles.headerImageContainer}>
                <Image source={{ uri: plant.image }} style={styles.headerImage} contentFit="cover" />
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.1)']}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Navbar */}
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- CONTENT SHEET --- */}
            <View style={styles.sheetContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Floating Header Info */}
                    <View style={styles.headerInfo}>
                        <View style={styles.pillRow}>
                            <View style={[styles.pill, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="bar-chart" size={12} color="#D97706" />
                                <ThemedText style={[styles.pillText, { color: '#D97706' }]}>{plant.difficulty}</ThemedText>
                            </View>
                            <View style={[styles.pill, { backgroundColor: '#ECFDF5' }]}>
                                <Ionicons name="leaf" size={12} color="#059669" />
                                <ThemedText style={[styles.pillText, { color: '#059669' }]}>{plant.latin}</ThemedText>
                            </View>
                        </View>
                        <ThemedText type="title" style={styles.title}>{plant.name}</ThemedText>
                        <ThemedText style={styles.desc}>{plant.description}</ThemedText>
                    </View>

                    {/* PROGRESS WIDGET */}
                    <View style={styles.progressWidget}>
                        <View style={styles.progressHeader}>
                            <View>
                                <ThemedText style={styles.progressLabel}>Total Progres</ThemedText>
                                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                                    <ThemedText type="title" style={styles.progressValue}>{plant.progress}%</ThemedText>
                                    <ThemedText style={styles.progressSub}>Selesai</ThemedText>
                                </View>
                            </View>
                            <View style={styles.xpCircle}>
                                <Ionicons name="flash" size={18} color="#F59E0B" />
                                <ThemedText style={styles.xpText}>{plant.totalXp}</ThemedText>
                            </View>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${plant.progress}%` }]} />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* TIMELINE SECTION */}
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Rangkaian Misi</ThemedText>

                    <View style={styles.timelineList}>
                        {plant.tasks.map((task, index) => {
                            const isLast = index === plant.tasks.length - 1;
                            const status = task.status as 'completed' | 'active' | 'locked';

                            return (
                                <View key={task.id} style={styles.timelineItem}>
                                    {/* Left: Connector Line & Dot */}
                                    <View style={styles.connectorColumn}>
                                        <View style={[styles.connectorLine, isLast && { display: 'none' }]} />
                                        <View style={[
                                            styles.dot,
                                            status === 'completed' && styles.dotCompleted,
                                            status === 'active' && styles.dotActive,
                                            status === 'locked' && styles.dotLocked
                                        ]}>
                                            {status === 'completed' && <Ionicons name="checkmark" size={12} color="#FFF" />}
                                            {status === 'active' && <View style={styles.dotActiveInner} />}
                                            {status === 'locked' && <Ionicons name="lock-closed" size={10} color="#9CA3AF" />}
                                        </View>
                                    </View>

                                    {/* Right: Content Card */}
                                    <TouchableOpacity
                                        style={[
                                            styles.taskCard,
                                            status === 'active' && styles.taskCardActive,
                                            status === 'locked' && styles.taskCardLocked
                                        ]}
                                        disabled={status === 'locked'}
                                        onPress={() => router.push({ pathname: '/missions/task/[taskId]', params: { taskId: task.id } })}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <ThemedText type="defaultSemiBold" style={[styles.taskTitle, status === 'locked' && { color: '#9CA3AF' }]}>
                                                {task.title}
                                            </ThemedText>
                                            <ThemedText style={styles.taskDesc} numberOfLines={2}>
                                                {task.desc}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.taskMeta}>
                                            <View style={styles.xpChip}>
                                                <ThemedText style={[styles.xpChipText, status === 'locked' && { color: '#9CA3AF' }]}>
                                                    +{task.xp} XP
                                                </ThemedText>
                                            </View>
                                            {status === 'active' && <Ionicons name="chevron-forward" size={16} color="#059669" />}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Modern Light BG
    },

    // HEADER IMAGE
    headerImageContainer: {
        height: 300,
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    navBar: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    navBtn: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(10px)',
    },

    // SHEET CONTAINER (White curve)
    sheetContainer: {
        flex: 1,
        marginTop: 240, // Overlap image
        backgroundColor: '#F9FAFB',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 40,
    },

    // INFO HEADER
    headerInfo: {
        marginBottom: 24,
    },
    pillRow: {
        flexDirection: 'row', gap: 8, marginBottom: 12,
    },
    pill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    },
    pillText: {
        fontSize: 12, fontWeight: '700',
    },
    title: {
        fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8,
    },
    desc: {
        fontSize: 14, color: '#4B5563', lineHeight: 22,
    },

    // PROGRESS WIDGET
    progressWidget: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1, borderColor: '#E5E7EB',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    progressHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16,
    },
    progressLabel: {
        fontSize: 12, color: '#6B7280', marginBottom: 4,
    },
    progressValue: {
        fontSize: 24, fontWeight: '800', color: '#111827',
    },
    progressSub: {
        fontSize: 12, color: '#9CA3AF', fontWeight: '500',
    },
    xpCircle: {
        alignItems: 'center', justifyContent: 'center',
    },
    xpText: {
        fontSize: 10, fontWeight: '700', color: '#D97706', marginTop: 2,
    },
    progressBarBg: {
        height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%', backgroundColor: '#059669', borderRadius: 4,
    },

    divider: {
        height: 1, backgroundColor: '#E5E7EB', marginVertical: 24,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 20,
    },

    // TIMELINE LIST
    timelineList: {
        gap: 0, // Gap handled by item padding
    },
    timelineItem: {
        flexDirection: 'row',
        minHeight: 80, // Ensure height for line
    },
    connectorColumn: {
        width: 30, alignItems: 'center', marginRight: 16,
    },
    connectorLine: {
        position: 'absolute', top: 24, bottom: -24, width: 2, backgroundColor: '#E5E7EB', zIndex: 0,
    },
    dot: {
        width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#FFF',
        alignItems: 'center', justifyContent: 'center', zIndex: 1,
    },
    dotCompleted: {
        backgroundColor: '#059669', borderColor: '#059669',
    },
    dotActive: {
        borderColor: '#059669', backgroundColor: '#FFF',
    },
    dotActiveInner: {
        width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669',
    },
    dotLocked: {
        backgroundColor: '#F3F4F6', borderColor: '#F3F4F6',
    },

    // TASK CARD
    taskCard: {
        flex: 1,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1, borderColor: '#F3F4F6',
        marginBottom: 16, // Bottom spacing for next item
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1,
    },
    taskCardActive: {
        borderColor: '#059669', borderWidth: 1,
        backgroundColor: '#ECFDF5', // Light green tint
        shadowColor: '#059669', shadowOpacity: 0.1,
    },
    taskCardLocked: {
        backgroundColor: '#F9FAFB', borderColor: 'transparent', shadowOpacity: 0,
    },
    taskTitle: {
        fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4,
    },
    taskDesc: {
        fontSize: 12, color: '#6B7280', lineHeight: 18,
    },
    taskMeta: {
        alignItems: 'flex-end', marginLeft: 12, gap: 8,
    },
    xpChip: {
        backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    xpChipText: {
        fontSize: 11, fontWeight: '700', color: '#059669',
    },
});
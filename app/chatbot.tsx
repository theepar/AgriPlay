import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { goBack } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    LayoutAnimation,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';

// Aktifkan LayoutAnimation untuk Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Interfaces ---
interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: number;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    lastModified: number;
}

export default function ChatbotScreen() {
    const insets = useSafeAreaInsets();
    // --- State ---
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // State History/Sesi
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    // Jangan menyimpan sebelum riwayat lama selesai dimuat, agar tidak tertimpa.
    const [sessionsLoaded, setSessionsLoaded] = useState(false);

    const flatListRef = useRef<FlatList<Message>>(null);
    const replyTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
    const messageCounter = useRef(0);

    // --- Effects ---
    useEffect(() => {
        loadSessions();
        return cancelPendingReply;
    }, []);

    // Auto scroll & Save saat pesan bertambah
    useEffect(() => {
        if (!sessionsLoaded || messages.length === 0) return;
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        const firstMsgText = messages[0].text;
        const sessionData: ChatSession = {
            id: currentSessionId,
            title: firstMsgText.substring(0, 30) + (firstMsgText.length > 30 ? '...' : ''),
            messages: messages,
            // Pakai waktu pesan terakhir agar membuka riwayat lama tidak mengubah tanggalnya.
            lastModified: messages[messages.length - 1].timestamp,
        };

        setSessions(prevSessions => {
            const updatedSessions = [...prevSessions];
            const index = updatedSessions.findIndex(s => s.id === currentSessionId);

            if (index >= 0) {
                updatedSessions[index] = sessionData;
            } else {
                updatedSessions.unshift(sessionData);
            }

            AsyncStorage.setItem('chat_sessions', JSON.stringify(updatedSessions)).catch(err => console.error(err));
            return updatedSessions;
        });
    }, [messages, currentSessionId, sessionsLoaded]);

    // --- Logic Storage & Session ---
    const loadSessions = async () => {
        try {
            const data = await AsyncStorage.getItem('chat_sessions');
            if (data) setSessions(JSON.parse(data));
        } catch (error) {
            console.error('Error loading sessions', error);
        } finally {
            setSessionsLoaded(true);
        }
    };

    const newMessageId = () => `${Date.now()}-${messageCounter.current++}`;

    // Balasan yang masih tertunda tidak boleh masuk ke percakapan lain.
    function cancelPendingReply() {
        replyTimers.current.forEach(clearTimeout);
        replyTimers.current.clear();
        setIsTyping(false);
    }

    const startNewChat = () => {
        cancelPendingReply();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages([]);
        setCurrentSessionId(Date.now().toString());
        setShowHistoryModal(false);
    };

    const loadSession = (session: ChatSession) => {
        cancelPendingReply();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(session.messages);
        setCurrentSessionId(session.id);
        setShowHistoryModal(false);
    };

    const deleteSession = (id: string) => {
        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);
        AsyncStorage.setItem('chat_sessions', JSON.stringify(newSessions)).catch(err => console.error(err));
        if (currentSessionId === id) startNewChat();
    };

    const confirmDelete = (session: ChatSession) => {
        if (Platform.OS === 'web') {
            if (window.confirm(`Hapus percakapan "${session.title}"?`)) deleteSession(session.id);
            return;
        }
        Alert.alert('Hapus percakapan?', `"${session.title}" akan dihapus permanen.`, [
            { text: 'Batal', style: 'cancel' },
            { text: 'Hapus', style: 'destructive', onPress: () => deleteSession(session.id) },
        ]);
    };

    // --- Logic Send Message ---
    const generateDummyResponse = (input: string) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('halo') || lowerInput.includes('hai')) return 'Halo sobat tani! 🌱 Ada yang bisa saya bantu?';
        if (lowerInput.includes('kentang')) return '🥔 Kentang butuh tanah gembur dan pH 5.0-6.5. Pastikan drainase lancar ya!';
        if (lowerInput.includes('hama')) return '🐛 Untuk hama, coba gunakan pestisida nabati dari daun mimba atau bawang putih.';
        return 'Saya dilatih khusus untuk pertanian. Bisa jelaskan lebih detail masalah tanamanmu?';
    };

    const handleSend = () => {
        const text = inputText.trim();
        if (text === '') return;

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newUserMessage: Message = {
            id: newMessageId(),
            text,
            sender: 'user',
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputText('');
        setIsTyping(true);

        const timer = setTimeout(() => {
            replyTimers.current.delete(timer);
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            const aiResponse: Message = {
                id: newMessageId(),
                text: generateDummyResponse(text),
                sender: 'ai',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsTyping(replyTimers.current.size > 0);
        }, 1500);
        replyTimers.current.add(timer);
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <ThemedText style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.aiText]}>
                {item.text}
            </ThemedText>
            <ThemedText style={[styles.timeText, item.sender === 'user' ? { color: '#ECFDF5' } : { color: '#6B7280' }]}>
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                <TouchableOpacity hitSlop={4} onPress={() => goBack()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Kembali">
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="leaf" size={16} color="#FFFFFF" />
                    </View>
                    <View>
                        <View style={{ flexDirection: 'row' }}>
                            <ThemedText style={styles.headerTitle}>Agra</ThemedText>
                            <ThemedText style={[styles.headerTitle, { color: '#047857' }]}>AI</ThemedText>
                        </View>
                        <ThemedText style={styles.headerSubtitle}>Asisten Cerdas Tani</ThemedText>
                    </View>
                </View>

                <TouchableOpacity hitSlop={4} onPress={() => setShowHistoryModal(true)} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Riwayat percakapan">
                    <Ionicons name="time-outline" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>

            {/* Keyboard Avoiding View */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Chat List */}
                <View style={styles.chatContainer}>
                    {messages.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBg}>
                                <Ionicons name="chatbubbles-outline" size={40} color="#047857" />
                            </View>
                            <ThemedText type="subtitle" style={styles.emptyStateTitle}>Mulai Diskusi</ThemedText>
                            <ThemedText style={styles.emptyStateSubtitle}>Tanyakan tentang bibit, pupuk, atau hama...</ThemedText>
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.messageListContent}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            ListFooterComponent={
                                isTyping ? (
                                    <View style={[styles.messageBubble, styles.aiBubble, { width: 60, alignItems: 'center' }]}>
                                        <ActivityIndicator size="small" color="#047857" />
                                    </View>
                                ) : null
                            }
                        />
                    )}
                </View>

                {/* Input Wrapper - Static Padding Only */}
                <View style={[styles.inputWrapper, { paddingBottom: Math.max(insets.bottom, 8) + 12 }]}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            accessibilityLabel="Pertanyaan untuk AgraAI"
                            placeholder="Ketik pertanyaanmu..."
                            value={inputText}
                            onChangeText={setInputText}
                            placeholderTextColor="#9CA3AF"
                            multiline
                            maxLength={200}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
                            onPress={handleSend}
                            disabled={inputText.trim() === ''}
                            accessibilityRole="button"
                            accessibilityLabel="Kirim pesan"
                        >
                            <Ionicons name="arrow-up" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>

            {/* Modal History */}
            <Modal
                visible={showHistoryModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowHistoryModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <ThemedText type="subtitle" style={styles.modalTitle}>Riwayat Percakapan</ThemedText>
                        <TouchableOpacity onPress={() => setShowHistoryModal(false)} style={styles.closeBtn} hitSlop={10} accessibilityRole="button" accessibilityLabel="Tutup riwayat">
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ padding: 20 }}>
                        <ThemedButton
                            title="Mulai Topik Baru"
                            onPress={startNewChat}
                            icon={<Ionicons name="add-circle" size={20} color="#FFF" />}
                        />
                    </View>

                    <FlatList
                        data={sessions}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity accessibilityRole="button"
                                style={[styles.historyItem, item.id === currentSessionId && styles.activeHistoryItem]}
                                onPress={() => loadSession(item)}
                            >
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="defaultSemiBold" style={styles.historyTitle} numberOfLines={1}>
                                        {item.title}
                                    </ThemedText>
                                    <ThemedText style={styles.historyDate}>
                                        {new Date(item.lastModified).toLocaleDateString()}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity
                                    onPress={() => confirmDelete(item)}
                                    style={{ padding: 8 }}
                                    hitSlop={6}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Hapus percakapan ${item.title}`}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Ionicons name="file-tray-outline" size={48} color="#D1D5DB" />
                                <ThemedText style={{ color: '#6B7280', marginTop: 10 }}>Belum ada riwayat</ThemedText>
                            </View>
                        }
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingBottom: 16,
        backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', zIndex: 10
    },
    iconBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F3F4F6' },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoContainer: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#047857', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: -2 },

    // Chat Layout
    chatContainer: { flex: 1 },
    messageListContent: { paddingHorizontal: 16, paddingBottom: 20, flexGrow: 1, justifyContent: 'flex-end' },

    // Empty State
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: -50 },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyStateTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
    emptyStateSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', maxWidth: '80%' },

    // Bubbles
    messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
    userBubble: { backgroundColor: '#047857', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    aiBubble: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: '#FFFFFF' },
    aiText: { color: '#1F2937' },
    timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },

    // Input Wrapper - FIXED PADDING
    inputWrapper: {
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#FFFFFF',
        borderRadius: 24, padding: 6, borderWidth: 1, borderColor: '#E5E7EB',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3
    },
    input: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1F2937', maxHeight: 100 },
    sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#047857', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
    sendButtonDisabled: { backgroundColor: '#D1D5DB' },

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#F9FAFB' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    closeBtn: { padding: 4 },
    historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: "#000", shadowOpacity: 0.02, shadowOffset: { width: 0, height: 2 } },
    activeHistoryItem: { borderColor: '#047857', backgroundColor: '#ECFDF5' },
    historyTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
    historyDate: { fontSize: 12, color: '#6B7280' }
});
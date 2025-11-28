import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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
    // --- State ---
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // State History/Sesi
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    // --- Effects ---
    useEffect(() => {
        loadSessions();
    }, []);

    // Auto scroll saat pesan bertambah
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
            saveCurrentSession();
        }
    }, [messages]);

    // --- Logic Storage & Session ---
    const loadSessions = async () => {
        try {
            const data = await AsyncStorage.getItem('chat_sessions');
            if (data) setSessions(JSON.parse(data));
        } catch (error) {
            console.error('Error loading sessions', error);
        }
    };

    const saveCurrentSession = async () => {
        const updatedSessions = [...sessions];
        const index = updatedSessions.findIndex(s => s.id === currentSessionId);
        const titleSnippet = messages[0]?.text.substring(0, 30) + (messages[0]?.text.length > 30 ? '...' : '') || 'Percakapan Baru';

        const sessionData: ChatSession = {
            id: currentSessionId,
            title: titleSnippet,
            messages: messages,
            lastModified: Date.now(),
        };

        if (index >= 0) updatedSessions[index] = sessionData;
        else updatedSessions.unshift(sessionData);

        setSessions(updatedSessions);
        await AsyncStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
    };

    const startNewChat = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages([]);
        setCurrentSessionId(Date.now().toString());
        setShowHistoryModal(false);
    };

    const loadSession = (session: ChatSession) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages(session.messages);
        setCurrentSessionId(session.id);
        setShowHistoryModal(false);
    };

    const deleteSession = async (id: string) => {
        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);
        await AsyncStorage.setItem('chat_sessions', JSON.stringify(newSessions));
        if (currentSessionId === id) startNewChat();
    };

    // --- Logic Send Message ---
    const handleSend = () => {
        if (inputText.trim() === '') return;

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputText('');
        setIsTyping(true);

        setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: generateDummyResponse(newUserMessage.text),
                sender: 'ai',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const generateDummyResponse = (input: string) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('halo') || lowerInput.includes('hai')) return 'Halo sobat tani! 🌱 Ada yang bisa saya bantu?';
        if (lowerInput.includes('kentang')) return '🥔 Kentang butuh tanah gembur dan pH 5.0-6.5.';
        if (lowerInput.includes('hama')) return '🐛 Coba gunakan pestisida nabati dari daun mimba.';
        return 'Saya dilatih khusus untuk pertanian. Bisa jelaskan lebih detail?';
    };

    // --- Render Items ---
    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            <ThemedText style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.aiText]}>{item.text}</ThemedText>
            <ThemedText style={[styles.timeText, item.sender === 'user' ? { color: '#A7F3D0' } : { color: '#9CA3AF' }]}>
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
        </View>
    );

    return (
        <ThemedView style={styles.container}>

            {/* 1. Header (Static - Tidak kena KeyboardAvoidingView) */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="leaf" size={16} color="#FFFFFF" />
                    </View>
                    <View>
                        <ThemedText style={styles.headerTitle}>Agra<ThemedText style={{ color: '#059669' }}>AI</ThemedText></ThemedText>
                        <ThemedText style={styles.headerSubtitle}>Asisten Cerdas Tani</ThemedText>
                    </View>
                </View>

                <TouchableOpacity onPress={() => setShowHistoryModal(true)} style={styles.iconButton}>
                    <Ionicons name="time-outline" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>

            {/* 2. KeyboardAvoidingView (Membungkus Chat List & Input) */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                // Android: undefined (serahkan ke OS 'resize'), iOS: 'padding'
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* 3. Chat List Container */}
                <View style={styles.chatContainer}>
                    {messages.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconBg}>
                                <Ionicons name="chatbubbles-outline" size={40} color="#059669" />
                            </View>
                            <ThemedText type="title" style={styles.emptyStateTitle}>Mulai Diskusi</ThemedText>
                            <ThemedText style={styles.emptyStateSubtitle}>Tanyakan tentang pertanian...</ThemedText>
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.messageListContent}
                            // Trigger scroll saat layout berubah (keyboard muncul)
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            ListFooterComponent={
                                isTyping ? (
                                    <View style={[styles.messageBubble, styles.aiBubble, { width: 60 }]}>
                                        <ActivityIndicator size="small" color="#059669" />
                                    </View>
                                ) : null
                            }
                        />
                    )}
                </View>

                {/* 4. Input Wrapper (Didalam KAV) */}
                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
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
                        <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
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
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.historyItem, item.id === currentSessionId && styles.activeHistoryItem]}
                                onPress={() => loadSession(item)}
                            >
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="defaultSemiBold" style={styles.historyTitle} numberOfLines={1}>{item.title}</ThemedText>
                                    <ThemedText style={styles.historyDate}>{new Date(item.lastModified).toLocaleDateString()}</ThemedText>
                                </View>
                                <TouchableOpacity onPress={() => deleteSession(item.id)} style={{ padding: 5 }}>
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<View style={{ marginTop: 50, alignItems: 'center' }}><ThemedText style={{ color: '#9CA3AF' }}>Belum ada riwayat</ThemedText></View>}
                    />
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16,
        backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', zIndex: 10
    },
    iconButton: { padding: 8, borderRadius: 12, backgroundColor: '#F3F4F6' },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoContainer: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827', lineHeight: 22 },
    headerSubtitle: { fontSize: 12, color: '#6B7280' },

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
    userBubble: { backgroundColor: '#059669', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    aiBubble: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F3F4F6' },
    messageText: { fontSize: 15, lineHeight: 22 },
    userText: { color: '#FFFFFF' },
    aiText: { color: '#1F2937' },
    timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },

    // Input Wrapper
    inputWrapper: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        // Di Android (resize mode) paddingBottom tidak perlu logic aneh2
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    },
    inputContainer: {
        flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#FFFFFF',
        borderRadius: 24, padding: 6, borderWidth: 1, borderColor: '#E5E7EB',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3
    },
    input: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1F2937', maxHeight: 100 },
    sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
    sendButtonDisabled: { backgroundColor: '#D1D5DB' },

    // Modal
    modalContainer: { flex: 1, backgroundColor: '#F9FAFB' },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
    historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    activeHistoryItem: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
    historyTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
    historyDate: { fontSize: 12, color: '#6B7280' }
});
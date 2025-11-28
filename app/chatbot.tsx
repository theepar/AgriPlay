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
    Text,
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
    // State Utama
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // State History/Sesi
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    // Load sesi saat pertama kali buka
    useEffect(() => {
        loadSessions();
    }, []);

    // Auto scroll saat ada pesan baru
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, isTyping]);

    // Simpan sesi setiap kali pesan berubah
    useEffect(() => {
        if (messages.length > 0) {
            saveCurrentSession();
        }
    }, [messages]);

    // --- Logic Storage ---

    const loadSessions = async () => {
        try {
            const data = await AsyncStorage.getItem('chat_sessions');
            if (data) {
                const parsedSessions: ChatSession[] = JSON.parse(data);
                setSessions(parsedSessions);
                // Load sesi terakhir jika ada, atau buat baru
                if (parsedSessions.length > 0) {
                    // Opsional: Load sesi terakhir. Di sini saya pilih mulai fresh tapi history tersimpan
                    // Jika ingin load terakhir: loadSession(parsedSessions[0]);
                }
            }
        } catch (error) {
            console.error('Error loading sessions', error);
        }
    };

    const saveCurrentSession = async () => {
        const updatedSessions = [...sessions];
        const index = updatedSessions.findIndex(s => s.id === currentSessionId);

        // Ambil cuplikan teks untuk judul (maks 30 char)
        const titleSnippet = messages[0]?.text.substring(0, 30) + (messages[0]?.text.length > 30 ? '...' : '') || 'Percakapan Baru';

        const sessionData: ChatSession = {
            id: currentSessionId,
            title: titleSnippet,
            messages: messages,
            lastModified: Date.now(),
        };

        if (index >= 0) {
            updatedSessions[index] = sessionData;
        } else {
            updatedSessions.unshift(sessionData); // Tambah ke paling atas
        }

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

        if (currentSessionId === id) {
            startNewChat();
        }
    };

    // --- Logic Chat ---

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
        setIsTyping(true); // Mulai animasi typing

        // Simulasi AI Response
        setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: generateDummyResponse(newUserMessage.text),
                sender: 'ai',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsTyping(false); // Stop animasi typing
        }, 1500);
    };

    const generateDummyResponse = (input: string) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('halo') || lowerInput.includes('hai')) {
            return 'Halo sobat tani! 🌱 Ada yang bisa saya bantu mengenai lahan atau tanamanmu hari ini?';
        } else if (lowerInput.includes('kentang')) {
            return '🥔 Untuk kentang, pastikan tanah gembur dan pH sekitar 5.0-6.5. Hindari genangan air agar umbi tidak busuk.';
        } else if (lowerInput.includes('hama')) {
            return '🐛 Hama apa yang menyerang? Untuk pencegahan alami, bisa gunakan pestisida nabati dari daun mimba atau bawang putih.';
        } else {
            return 'Hmm, menarik. Bisa jelaskan lebih detail? Saya dilatih khusus untuk pertanian, perkebunan, dan agroteknologi.';
        }
    };

    // --- Render Components ---

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.aiBubble
        ]}>
            <Text style={[
                styles.messageText,
                item.sender === 'user' ? styles.userText : styles.aiText
            ]}>
                {item.text}
            </Text>
            <Text style={[styles.timeText, item.sender === 'user' ? { color: '#A7F3D0' } : { color: '#9CA3AF' }]}>
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header Modern */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="leaf" size={16} color="#FFFFFF" />
                    </View>
                    <View>
                        <ThemedText style={styles.headerTitle}>Agra<Text style={{ color: '#059669' }}>AI</Text></ThemedText>
                        <Text style={styles.headerSubtitle}>Asisten Cerdas Tani</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={() => setShowHistoryModal(true)} style={styles.iconButton}>
                    <Ionicons name="time-outline" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>

            {/* Chat Area */}
            <View style={styles.chatContainer}>
                {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconBg}>
                            <Ionicons name="chatbubbles-outline" size={40} color="#059669" />
                        </View>
                        <ThemedText style={styles.emptyStateTitle}>Mulai Diskusi Baru</ThemedText>
                        <Text style={styles.emptyStateSubtitle}>
                            Tanyakan tentang pupuk, cuaca, atau hama tanaman.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messageList}
                        showsVerticalScrollIndicator={false}
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

            {/* Input Area Floating */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
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

            {/* MODAL HISTORY */}
            <Modal
                visible={showHistoryModal}
                animationType="slide"
                presentationStyle="pageSheet" // iOS style
                onRequestClose={() => setShowHistoryModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Riwayat Percakapan</Text>
                        <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                            <Ionicons name="close" size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.newChatButton} onPress={startNewChat}>
                        <Ionicons name="add-circle" size={20} color="#FFF" />
                        <Text style={styles.newChatText}>Mulai Topik Baru</Text>
                    </TouchableOpacity>

                    <FlatList
                        data={sessions}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 20 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.historyItem,
                                    item.id === currentSessionId && styles.activeHistoryItem
                                ]}
                                onPress={() => loadSession(item)}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.historyDate}>
                                        {new Date(item.lastModified).toLocaleDateString()} • {new Date(item.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => deleteSession(item.id)} style={{ padding: 5 }}>
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={{ marginTop: 50, alignItems: 'center' }}>
                                <Text style={{ color: '#9CA3AF' }}>Belum ada riwayat percakapan</Text>
                            </View>
                        }
                    />
                </View>
            </Modal>

        </ThemedView>
    );
}

// --- Styles Modern ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Cool Gray 50 background
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        zIndex: 10,
    },
    iconButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#059669', // Emerald 600
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        lineHeight: 22,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    // Chat Area
    chatContainer: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: -50,
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ECFDF5', // Emerald 50
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: '80%',
    },
    messageList: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 14,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    userBubble: {
        backgroundColor: '#059669', // Emerald 600
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#FFFFFF',
    },
    aiText: {
        color: '#1F2937',
    },
    timeText: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    // Input Area
    inputWrapper: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1F2937',
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#059669',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    sendButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    newChatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#059669',
        margin: 20,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    newChatText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    activeHistoryItem: {
        borderColor: '#059669',
        backgroundColor: '#ECFDF5',
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    historyDate: {
        fontSize: 12,
        color: '#6B7280',
    }
});
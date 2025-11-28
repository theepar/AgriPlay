import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: number;
}

export default function ChatbotScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        loadChatHistory();
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory(messages);
            // Scroll to bottom when new message arrives
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const loadChatHistory = async () => {
        try {
            const history = await AsyncStorage.getItem('chat_history');
            if (history) {
                setMessages(JSON.parse(history));
            }
        } catch (error) {
            console.error('Failed to load chat history', error);
        }
    };

    const saveChatHistory = async (msgs: Message[]) => {
        try {
            await AsyncStorage.setItem('chat_history', JSON.stringify(msgs));
        } catch (error) {
            console.error('Failed to save chat history', error);
        }
    };

    const handleSend = () => {
        if (inputText.trim() === '') return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputText('');

        // Simulate AI Response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: generateDummyResponse(newUserMessage.text),
                sender: 'ai',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, aiResponse]);
        }, 1000);
    };

    const generateDummyResponse = (input: string) => {
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('halo') || lowerInput.includes('hai')) {
            return 'Halo! Ada yang bisa saya bantu mengenai tanamanmu hari ini?';
        } else if (lowerInput.includes('kentang')) {
            return 'Kentang membutuhkan tanah yang gembur dan penyiraman yang cukup. Pastikan drainase pot bagus ya!';
        } else if (lowerInput.includes('pupuk')) {
            return 'Untuk fase pertumbuhan daun, gunakan pupuk tinggi Nitrogen. Saat berbuah, gunakan pupuk tinggi Kalium.';
        } else {
            return 'Maaf, saya masih belajar. Bisa jelaskan lebih detail pertanyaanmu tentang pertanian?';
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.sender === 'user' ? styles.userBubble : styles.aiBubble
        ]}>
            <ThemedText style={[
                styles.messageText,
                item.sender === 'user' ? styles.userText : styles.aiText
            ]}>
                {item.text}
            </ThemedText>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </Pressable>

                <View style={styles.headerTitleContainer}>
                    <ThemedText style={styles.headerTitleText}>agrarian</ThemedText>
                    <Ionicons name="leaf" size={18} color="#4CAF50" style={{ marginHorizontal: 2 }} />
                    <ThemedText style={[styles.headerTitleText, { color: '#FFD700' }]}>AI</ThemedText>
                </View>

                <Pressable style={styles.historyButton}>
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#000" />
                </Pressable>
            </View>

            {/* Chat Area */}
            <View style={styles.chatContainer}>
                {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                        <ThemedText style={styles.emptyStateTitle}>Ada yang bisa dibantu?</ThemedText>
                        <View style={styles.emptyStateSubtitleContainer}>
                            <ThemedText style={styles.emptyStateSubtitle}>Agri AI</ThemedText>
                            <ThemedText style={[styles.emptyStateSubtitle, { color: '#000', fontWeight: 'bold' }]}> disini</ThemedText>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messageList}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Tanya Agra AI apa saja..."
                        value={inputText}
                        onChangeText={setInputText}
                        placeholderTextColor="#999"
                    />
                    <Pressable
                        style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={inputText.trim() === ''}
                    >
                        <Ionicons name="send" size={20} color={inputText.trim() === '' ? '#ccc' : '#4CAF50'} />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    historyButton: {
        padding: 5,
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#000',
        marginBottom: 10,
    },
    emptyStateSubtitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 22,
        color: '#fce4ec', // Very light pink/red as in image for "Agri AI" part? Actually image shows "Agri AI" in very light color
        fontWeight: 'bold',
    },
    messageList: {
        padding: 20,
        paddingBottom: 40,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
    },
    userBubble: {
        backgroundColor: '#E8F5E9',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: '#f5f5f5',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: '#2D5F3F',
    },
    aiText: {
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 15,
        color: '#333',
        marginRight: 10,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.7,
    },
});

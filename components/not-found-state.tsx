import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedButton } from './themed-button';
import { ThemedText } from './themed-text';

export type NotFoundStateProps = {
    title: string;
    message: string;
};

export function NotFoundState({ title, message }: NotFoundStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconBg}>
                <Ionicons name="leaf-outline" size={40} color="#047857" />
            </View>
            <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.message}>{message}</ThemedText>
            <ThemedButton title="Ke Beranda" onPress={() => router.dismissTo('/')} style={styles.button} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 12,
        backgroundColor: '#F9FAFB',
    },
    iconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ECFDF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 20,
        color: '#111827',
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 12,
    },
    button: {
        maxWidth: 320,
    },
});

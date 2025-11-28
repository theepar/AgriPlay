import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PLANTS_DATA } from '@/constants/plants';

// activeMissions is now derived from PLANTS_DATA
const activeMissions = PLANTS_DATA.map(plant => ({
    id: plant.id,
    name: plant.name,
    icon: 'leaf'
}));

export default function MissionsListScreen() {
    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.navigate('/')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#2D5F3F" />
                </Pressable>
                <ThemedText style={styles.headerTitle}>Daftar misi</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={styles.title}>Daftar misi yang aktif</ThemedText>

                <View style={styles.grid}>
                    {activeMissions.map((mission) => (
                        <Pressable
                            key={mission.id}
                            style={styles.card}
                            onPress={() => router.push({ pathname: '/missions/[id]', params: { id: mission.id } })}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name="leaf" size={40} color="#4CAF50" />
                            </View>
                            <ThemedText style={styles.cardTitle}>{mission.name}</ThemedText>
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
    title: {
        fontSize: 24,
        marginBottom: 30,
        color: '#000',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    card: {
        width: '47%',
        aspectRatio: 1,
        backgroundColor: '#F1F8E9',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    iconContainer: {
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2D5F3F',
        textAlign: 'center',
    },
});

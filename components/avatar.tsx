import { StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from './themed-text';

export type AvatarProps = {
    name: string;
    size?: number;
    style?: ViewStyle;
};

function getInitials(name: string): string {
    const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
    const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('');
    return initials || '?';
}

/** Avatar berbasis inisial nama (tidak butuh foto profil). */
export function Avatar({ name, size = 44, style }: AvatarProps) {
    return (
        <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, style]}>
            <ThemedText style={[styles.initials, { fontSize: size * 0.38, lineHeight: size * 0.5 }]}>
                {getInitials(name)}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    circle: {
        backgroundColor: '#047857',
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        color: '#FFFFFF',
        fontFamily: 'Inter_700Bold',
        fontWeight: '700',
    },
});

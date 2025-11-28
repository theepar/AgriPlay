import { Pressable, StyleSheet, type PressableProps, type ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';

export type ThemedButtonProps = Omit<PressableProps, 'style'> & {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    disabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
};

export function ThemedButton({
    title,
    variant = 'primary',
    disabled = false,
    fullWidth = true,
    style,
    ...rest
}: ThemedButtonProps) {
    const buttonStyles: ViewStyle[] = [
        styles.button,
        fullWidth ? styles.fullWidth : {},
        variant === 'primary' ? (disabled ? styles.buttonInactive : styles.buttonActive) : {},
        variant === 'secondary' ? styles.buttonSecondary : {},
        variant === 'outline' ? styles.buttonOutline : {},
        style || {},
    ];

    const textStyles = [
        styles.buttonText,
        variant === 'primary' && (disabled ? styles.buttonTextInactive : styles.buttonTextActive),
        variant === 'secondary' && styles.buttonTextSecondary,
        variant === 'outline' && styles.buttonTextOutline,
    ];

    return (
        <Pressable
            style={buttonStyles}
            disabled={disabled}
            {...rest}
        >
            <ThemedText style={textStyles}>
                {title}
            </ThemedText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    fullWidth: {
        width: '100%',
    },
    // Primary variant (default) - Green when active, Gray when inactive
    buttonInactive: {
        backgroundColor: '#E0E0E0',
    },
    buttonActive: {
        backgroundColor: '#059669',
    },
    buttonTextInactive: {
        color: '#999',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    buttonTextActive: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    // Secondary variant - Light green background
    buttonSecondary: {
        backgroundColor: '#E8F5E9',
    },
    buttonTextSecondary: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    // Outline variant
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    buttonTextOutline: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    buttonText: {
        textAlign: 'center',
    },
});

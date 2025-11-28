import { Pressable, StyleSheet, type PressableProps, type TextStyle, type ViewStyle } from 'react-native';
import { ThemedText } from './themed-text';

export type ThemedButtonProps = Omit<PressableProps, 'style'> & {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    disabled?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    icon?: React.ReactNode; // Opsional: jika ingin menambah icon nanti
};

export function ThemedButton({
    title,
    variant = 'primary',
    disabled = false,
    fullWidth = true,
    style,
    icon,
    ...rest
}: ThemedButtonProps) {

    // Helper untuk style dinamis berdasarkan state tombol
    const getButtonStyle = ({ pressed }: { pressed: boolean }): ViewStyle[] => {
        const baseStyles: ViewStyle[] = [
            styles.button,
            fullWidth ? styles.fullWidth : {},
            style || {},
        ];

        // Efek tekan (Pressed State)
        if (pressed && !disabled) {
            baseStyles.push(styles.pressed);
        }

        // Styles per Variant
        if (disabled) {
            baseStyles.push(styles.buttonDisabled);
        } else {
            switch (variant) {
                case 'primary':
                    break;
                case 'secondary':
                    baseStyles.push(styles.buttonSecondary);
                    break;
                case 'outline':
                    baseStyles.push(styles.buttonOutline);
                    break;
                case 'danger':
                    baseStyles.push(styles.buttonDanger);
                    break;
            }
        }

        return baseStyles;
    };

    const getTextStyle = (): TextStyle[] => {
        const baseTextStyles: TextStyle[] = [styles.buttonText];

        if (disabled) {
            baseTextStyles.push(styles.textDisabled);
            return baseTextStyles;
        }

        switch (variant) {
            case 'primary':
                baseTextStyles.push(styles.textPrimary);
                break;
            case 'secondary':
                baseTextStyles.push(styles.textSecondary);
                break;
            case 'outline':
                baseTextStyles.push(styles.textOutline);
                break;
            case 'danger':
                baseTextStyles.push(styles.textDanger);
                break;
        }

        return baseTextStyles;
    };

    return (
        <Pressable
            style={getButtonStyle}
            disabled={disabled}
            {...rest}
        >
            {/* Render Icon jika ada */}
            {icon && icon}

            <ThemedText style={getTextStyle()}>
                {title}
            </ThemedText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 52, // Fixed height agar konsisten dengan Input
        paddingHorizontal: 24,
        borderRadius: 16, // Konsisten dengan Login Input
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8, // Jarak antara icon dan text
    },
    fullWidth: {
        width: '100%',
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }], // Efek tekan halus
    },

    // --- VARIANTS BACKGROUND ---
    buttonPrimary: {
        backgroundColor: '#059669', // Emerald-600
        // Colored Shadow (Modern Glow)
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonSecondary: {
        backgroundColor: '#ECFDF5', // Emerald-50
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#059669',
    },
    buttonDanger: {
        backgroundColor: '#FEE2E2', // Red-100
    },
    buttonDisabled: {
        backgroundColor: '#F3F4F6', // Gray-100
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },

    // --- TEXT STYLES ---
    buttonText: {
        fontSize: 16,
        fontWeight: '700', // Lebih tebal agar terbaca jelas
        textAlign: 'center',
    },
    textPrimary: {
        color: '#FFFFFF',
    },
    textSecondary: {
        color: '#059669',
    },
    textOutline: {
        color: '#059669',
    },
    textDanger: {
        color: '#DC2626',
    },
    textDisabled: {
        color: '#9CA3AF', // Gray-400
    },
});
import { Alert, Platform } from 'react-native';

/** Alert satu tombol yang juga tampil di web (Alert.alert di react-native-web tidak melakukan apa-apa). */
export function showAlert(title: string, message: string, options: { buttonText?: string; onDismiss?: () => void } = {}) {
    const { buttonText = 'OK', onDismiss } = options;
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
        onDismiss?.();
        return;
    }
    Alert.alert(title, message, [{ text: buttonText, onPress: onDismiss }], { cancelable: false });
}

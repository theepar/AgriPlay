import { router, type Href } from 'expo-router';

/** Kembali ke layar sebelumnya; jika dibuka langsung (deep link / URL web), buka `fallback`. */
export function goBack(fallback: Href = '/') {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
}

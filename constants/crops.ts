/**
 * Katalog label tanaman yang dikeluarkan model ML (bahasa Inggris, 14 kelas)
 * beserta info tampilan dalam bahasa Indonesia. Waktu tumbuh adalah perkiraan
 * sampai panen pertama.
 */
export interface CropInfo {
    name: string;
    difficulty: 'Mudah' | 'Sedang' | 'Sulit';
    growthTime: string;
    description: string;
    /** ID di PLANTS_DATA jika tanaman ini punya rangkaian misi. */
    plantId?: string;
}

export const CROP_CATALOG: Record<string, CropInfo> = {
    'beans': {
        name: 'Kacang-kacangan',
        difficulty: 'Mudah',
        growthTime: '50-60 Hari',
        description: 'Kacang-kacangan adalah tanaman yang kaya protein dan mudah ditanam. Cocok untuk pemula karena perawatannya minimal dan dapat memperbaiki kesuburan tanah secara alami.',
    },
    'carrots and turnips': {
        name: 'Wortel & Lobak',
        difficulty: 'Mudah',
        growthTime: '60-100 Hari',
        description: 'Wortel dan lobak adalah tanaman umbi yang kaya nutrisi dan mudah dibudidayakan. Membutuhkan tanah gembur dan penyiraman teratur untuk hasil optimal.',
    },
    'chillies and peppers': {
        name: 'Cabai & Paprika',
        difficulty: 'Sedang',
        growthTime: '80-90 Hari',
        description: 'Cabai dan paprika adalah tanaman yang produktif dan berbuah lebat. Cocok untuk ditanam di pot atau kebun dengan sinar matahari penuh.',
        plantId: '3',
    },
    'cinnamon and cinnamon-tree flowers': {
        name: 'Kayu Manis',
        difficulty: 'Sulit',
        growthTime: '4-6 Tahun',
        description: 'Kayu manis adalah tanaman rempah bernilai tinggi yang berasal dari kulit pohon. Membutuhkan iklim tropis lembab dan waktu panen yang panjang.',
    },
    'cloves': {
        name: 'Cengkeh',
        difficulty: 'Sulit',
        growthTime: '4-5 Tahun',
        description: 'Cengkeh adalah tanaman rempah aromatik yang sangat berharga. Membutuhkan iklim tropis dengan curah hujan tinggi dan tanah vulkanik yang subur.',
    },
    'cucumbers and gherkins': {
        name: 'Mentimun',
        difficulty: 'Mudah',
        growthTime: '35-45 Hari',
        description: 'Mentimun adalah tanaman merambat yang cepat tumbuh dan produktif. Cocok untuk pemula dengan kebutuhan air yang cukup banyak.',
    },
    'eggplants': {
        name: 'Terong',
        difficulty: 'Mudah',
        growthTime: '60-90 Hari',
        description: 'Terong adalah tanaman buah yang mudah ditanam dan berbuah lebat. Membutuhkan sinar matahari penuh dan penyiraman teratur.',
    },
    'leeks and other alliaceous vegetables': {
        name: 'Daun Bawang',
        difficulty: 'Mudah',
        growthTime: '60-75 Hari',
        description: 'Daun bawang dan keluarga bawang-bawangan mudah ditanam dan serba guna di dapur. Cocok untuk berbagai kondisi tanah dan iklim.',
    },
    'onions and shallots': {
        name: 'Bawang Merah & Bombay',
        difficulty: 'Sedang',
        growthTime: '55-70 Hari',
        description: 'Bawang merah dan bawang bombay adalah tanaman umbi yang cukup mudah ditanam. Tanaman ini tahan terhadap berbagai kondisi cuaca.',
    },
    'pepper': {
        name: 'Lada',
        difficulty: 'Sulit',
        growthTime: '2-3 Tahun',
        description: 'Lada adalah tanaman rempah merambat yang bernilai ekonomi tinggi. Membutuhkan iklim tropis lembab dengan sistem penyangga yang baik.',
    },
    'potatoes': {
        name: 'Kentang',
        difficulty: 'Sedang',
        growthTime: '90-120 Hari',
        description: 'Kentang adalah tanaman umbi yang produktif dan mudah ditanam. Membutuhkan tanah gembur dan suhu sejuk untuk hasil optimal.',
        plantId: '1',
    },
    'tea leaves': {
        name: 'Teh',
        difficulty: 'Sulit',
        growthTime: '± 3 Tahun',
        description: 'Teh adalah tanaman perkebunan yang tumbuh baik di dataran tinggi. Membutuhkan iklim sejuk dengan curah hujan merata sepanjang tahun.',
    },
    'tomatoes': {
        name: 'Tomat',
        difficulty: 'Mudah',
        growthTime: '60-80 Hari',
        description: 'Tomat adalah tanaman buah yang produktif dan serbaguna. Membutuhkan sinar matahari penuh dan penyangga untuk pertumbuhan vertikal.',
        plantId: '2',
    },
    'vanilla': {
        name: 'Vanili',
        difficulty: 'Sulit',
        growthTime: '3-4 Tahun',
        description: 'Vanili adalah tanaman rempah merambat dengan nilai ekonomi sangat tinggi. Membutuhkan pohon penyangga, iklim tropis lembab, dan penyerbukan manual.',
    },
};

/** Info tampilan untuk label dari model; label yang belum dikenal tetap ditampilkan apa adanya. */
export function getCropInfo(label: string): CropInfo {
    const known = CROP_CATALOG[label.toLowerCase()];
    if (known) return known;
    return {
        name: label.charAt(0).toUpperCase() + label.slice(1),
        difficulty: 'Sedang',
        growthTime: '-',
        description: `${label} adalah tanaman yang cocok untuk kondisi iklim lokasi Anda berdasarkan analisis AI.`,
    };
}

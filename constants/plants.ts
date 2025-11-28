export const PLANTS_DATA = [
    {
        id: '1',
        name: 'Kentang',
        description: 'Kentang, ubi kentang, ubi belanda, atau ubi benggala adalah tanaman dari suku Solanaceae yang memiliki umbi batang yang dapat dimakan dan disebut "kentang". Umbi kentang sekarang telah menjadi salah satu makanan pokok penting di Eropa walaupun pada awalnya didatangkan dari Amerika Selatan.',
        image: require('@/assets/images/kentang.png'), // Ensure this image exists or use a placeholder
        tasks: [
            { id: '1-1', title: 'Teliti Tanamannya', xp: 100, status: 'active' },
            { id: '1-2', title: 'Kumpulkan Barang Persiapan', xp: 100, status: 'locked' },
            { id: '1-3', title: 'Buat Pot Khusus', xp: 100, status: 'locked' },
            { id: '1-4', title: 'Mulai Menanam', xp: 100, status: 'locked' },
            { id: '1-5', title: 'Penyiraman Pertama', xp: 100, status: 'locked' },
        ]
    },
    {
        id: '2',
        name: 'Wortel',
        description: 'Wortel adalah tumbuhan biennial dalam famili Umbelliferae yang menyimpan karbohidrat dalam jumlah besar untuk tumbuhan tersebut berbunga pada tahun kedua. Batang bunga tumbuh setinggi sekitar 1 m, dengan bunga berwarna putih, dan rasanya yang manis langu.',
        image: require('@/assets/images/homepage-1.png'), // Placeholder
        tasks: [
            { id: '2-1', title: 'Pilih Bibit Wortel', xp: 100, status: 'active' },
            { id: '2-2', title: 'Siapkan Tanah Gembur', xp: 100, status: 'locked' },
            { id: '2-3', title: 'Tabur Benih', xp: 100, status: 'locked' },
            { id: '2-4', title: 'Penyiraman Rutin', xp: 100, status: 'locked' },
        ]
    },
    {
        id: '3',
        name: 'Bengkuang',
        description: 'Bengkuang atau bengkoang dikenal dari umbi (cormus) putihnya yang bisa dimakan sebagai komponen rujak dan asinan atau dijadikan masker untuk menyegarkan wajah dan memutihkan kulit. Tumbuhan yang berasal dari Amerika tropis ini termasuk dalam suku polong-polongan atau Fabaceae.',
        image: require('@/assets/images/homepage-2.png'), // Placeholder
        tasks: [
            { id: '3-1', title: 'Kenali Bengkuang', xp: 100, status: 'active' },
            { id: '3-2', title: 'Persiapan Lahan', xp: 100, status: 'locked' },
            { id: '3-3', title: 'Penanaman', xp: 100, status: 'locked' },
            { id: '3-4', title: 'Perawatan Awal', xp: 100, status: 'locked' },
        ]
    }
];

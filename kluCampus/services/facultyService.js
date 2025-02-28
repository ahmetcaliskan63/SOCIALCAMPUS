import facultiesData from '../data/faculties.json';

export const fetchFaculties = async () => {
    try {
        // faculties.json dosyasından fakülte verilerini döndür
        return facultiesData;
    } catch (error) {
        console.error('Fakülte bilgileri alınırken hata:', error);
        return null;
    }
}; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookService } from '../../services/api';

const API_URL = 'http://192.168.133.242:5000/api'; // Express API URL

// Cache sabitleri
const CACHE_DURATION = 48 * 60 * 60 * 1000; // 48 saat
const MAX_BOOKS = 30;

const fetchBooks = async () => {
  try {
    // Cache kontrolü
    const cachedBooks = await AsyncStorage.getItem('cached_books');
    const lastUpdate = await AsyncStorage.getItem('books_last_update');
    
    if (cachedBooks && lastUpdate) {
      const timeDiff = Date.now() - parseInt(lastUpdate);
      // 48 saat eski değilse cache'den kullan
      if (timeDiff < CACHE_DURATION) {
        setBooks(JSON.parse(cachedBooks));
        setLoading(false);
        return;
      }
    }

    // Express.js backend'den kitapları çek
    const response = await bookService.getAllBooks();
    
    if (response.success) {
      const booksData = response.data.slice(0, MAX_BOOKS);

      // Cache'e kaydet
      await AsyncStorage.setItem('cached_books', JSON.stringify(booksData));
      await AsyncStorage.setItem('books_last_update', Date.now().toString());

      setBooks(booksData);
    } else {
      console.error('Kitaplar getirilemedi:', response.message);
    }

    setLoading(false);
  } catch (error) {
    console.error('Kitap yükleme hatası:', error);
    setLoading(false);
    setError('Kitaplar yüklenirken bir hata oluştu');
  }
};

const addBook = async (bookData) => {
  try {
    const response = await bookService.createBook(bookData);
    
    if (response.success) {
      // Cache'i güncelle
      const cachedBooks = await AsyncStorage.getItem('cached_books');
      if (cachedBooks) {
        const books = JSON.parse(cachedBooks);
        books.unshift(response.data);
        await AsyncStorage.setItem('cached_books', JSON.stringify(books));
      }
      
      // State'i güncelle
      setBooks(prevBooks => [response.data, ...prevBooks]);
    } else {
      console.error('Kitap eklenemedi:', response.message);
    }
  } catch (error) {
    console.error('Kitap ekleme hatası:', error);
    throw error;
  }
};

const updateBook = async (bookId, bookData) => {
  try {
    const response = await bookService.updateBook(bookId, bookData);
    
    if (response.success) {
      // Cache'i güncelle
      const cachedBooks = await AsyncStorage.getItem('cached_books');
      if (cachedBooks) {
        const books = JSON.parse(cachedBooks);
        const index = books.findIndex(book => book.id === bookId);
        if (index !== -1) {
          books[index] = response.data;
          await AsyncStorage.setItem('cached_books', JSON.stringify(books));
        }
      }
      
      // State'i güncelle
      setBooks(prevBooks => 
        prevBooks.map(book => 
          book.id === bookId ? response.data : book
        )
      );
    } else {
      console.error('Kitap güncellenemedi:', response.message);
    }
  } catch (error) {
    console.error('Kitap güncelleme hatası:', error);
    throw error;
  }
};

const deleteBook = async (bookId) => {
  try {
    const response = await bookService.deleteBook(bookId);
    
    if (response.success) {
      // Cache'i güncelle
      const cachedBooks = await AsyncStorage.getItem('cached_books');
      if (cachedBooks) {
        const books = JSON.parse(cachedBooks);
        const filteredBooks = books.filter(book => book.id !== bookId);
        await AsyncStorage.setItem('cached_books', JSON.stringify(filteredBooks));
      }
      
      // State'i güncelle
      setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    } else {
      console.error('Kitap silinemedi:', response.message);
    }
  } catch (error) {
    console.error('Kitap silme hatası:', error);
    throw error;
  }
}; 
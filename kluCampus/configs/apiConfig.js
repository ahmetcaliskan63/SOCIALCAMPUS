// API endpoint'leri için temel URL
export const API_BASE_URL = 'http://192.168.141.242:5000/api';

// API endpoint'leri
export const API_ENDPOINTS = {
  // Kullanıcı endpoint'leri
  users: {
    create: '/users',
    get: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
    getByFaculty: (faculty) => `/users/fakulte/${faculty}`,
  },

  // Kitap endpoint'leri
  books: {
    create: '/books',
    getAll: '/books',
    get: (id) => `/books/${id}`,
    update: (id) => `/books/${id}`,
    delete: (id) => `/books/${id}`,
    getByCategory: (category) => `/books/kategori/${category}`,
    getByFaculty: (faculty) => `/books/fakulte/${faculty}`,
  },

  // Mesaj endpoint'leri
  messages: {
    create: '/messages',
    getAll: '/messages',
    get: (id) => `/messages/${id}`,
    delete: (id) => `/messages/${id}`,
    getByUser: (userId) => `/messages/kullanici/${userId}`,
  },
};

// API istek yapılandırması
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye
}; 
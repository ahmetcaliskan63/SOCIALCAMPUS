const axios = require('axios');

class ApiAdapter {
    constructor() {
        this.baseURL = 'http://192.168.38.242:5000/api';
        this.token = null;
    }

    setToken(token) {
        this.token = token;
    }

    async getHeaders() {
        if (!this.token) {
            throw new Error('Token bulunamadı');
        }
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // Kullanıcı İşlemleri
    async createUser(userData) {
        try {
            const response = await axios.post(`${this.baseURL}/users`, userData);
            if (response.data && response.data.success) {
                const { token, ...userInfo } = response.data.data;
                this.setToken(token);
                return userInfo;
            }
            throw new Error(response.data.message || 'Kullanıcı oluşturulamadı');
        } catch (error) {
            console.error('createUser error:', error.message);
            throw error;
        }
    }

    async updateUser(userId, userData) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.put(`${this.baseURL}/users/${userId}`, userData, { headers });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Kullanıcı güncellenemedi');
        } catch (error) {
            console.error('updateUser error:', error.message);
            throw error;
        }
    }

    async getUser(userId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseURL}/users/${userId}`, { headers });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Kullanıcı bilgileri alınamadı');
        } catch (error) {
            console.error('getUser error:', error.message);
            throw error;
        }
    }

    // Mesaj İşlemleri
    async createMessage(messageData) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${this.baseURL}/messages`, messageData, { headers });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Mesaj gönderilemedi');
        } catch (error) {
            console.error('createMessage error:', error.message);
            throw error;
        }
    }

    async getMessages(limit = 50) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseURL}/messages?limit=${limit}`, { headers });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Mesajlar alınamadı');
        } catch (error) {
            console.error('getMessages error:', error.message);
            throw error;
        }
    }

    async deleteMessage(messageId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.delete(`${this.baseURL}/messages/${messageId}`, { headers });
            if (response.data && response.data.success) {
                return true;
            }
            throw new Error(response.data.message || 'Mesaj silinemedi');
        } catch (error) {
            console.error('deleteMessage error:', error.message);
            throw error;
        }
    }

    // Kitap İşlemleri
    async createBook(bookData) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${this.baseURL}/books`, bookData, { headers });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Kitap eklenemedi');
        } catch (error) {
            console.error('createBook error:', error.message);
            throw error;        }
    }

    async getBooks(limit = 50, offset = 0) {
        try {
            const response = await axios.get(`${this.baseURL}/books?limit=${limit}&offset=${offset}`);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Kitaplar alınamadı');
        } catch (error) {
            console.error('getBooks error:', error.message);
            throw error;
        }
    }

    async getBook(bookId) {
        try {
            const response = await axios.get(`${this.baseURL}/books/${bookId}`);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Kitap bilgileri alınamadı');
        } catch (error) {
            console.error('getBook error:', error.message);
            throw error;
        }
    }

    async updateBook(bookId, bookData) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.put(`${this.baseURL}/books/${bookId}`, bookData, { headers });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Kitap güncellenemedi');
        } catch (error) {
            console.error('updateBook error:', error.message);
            throw error;
        }
    }

    async deleteBook(bookId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.delete(`${this.baseURL}/books/${bookId}`, { headers });
            if (response.data && response.data.success) {
                return true;
            }
            throw new Error(response.data.message || 'Kitap silinemedi');
        } catch (error) {
            console.error('deleteBook error:', error.message);
            throw error;
        }
    }

    async searchBooks(query) {
        try {
            const response = await axios.get(`${this.baseURL}/books/search?q=${encodeURIComponent(query)}`);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Kitap araması yapılamadı');
        } catch (error) {
            console.error('searchBooks error:', error.message);
            throw error;
        }
    }

    // Gündem Konuları İşlemleri
    async createTrend(trendData) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${this.baseURL}/trends`, trendData, { headers });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Gündem konusu eklenemedi');
        } catch (error) {
            console.error('createTrend error:', error.message);
            throw error;
        }
    }

    async getTrends() {
        try {
            const response = await axios.get(`${this.baseURL}/trends`);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Gündem konuları alınamadı');
        } catch (error) {
            console.error('getTrends error:', error.message);
            throw error;
        }
    }

    async getTrend(trendId) {
        try {
            const response = await axios.get(`${this.baseURL}/trends/${trendId}`);
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Gündem konusu bilgileri alınamadı');
        } catch (error) {
            console.error('getTrend error:', error.message);
            throw error;
        }
    }

    async updateTrend(trendId, trendData) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.put(`${this.baseURL}/trends/${trendId}`, trendData, { headers });
            if (response.data && response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Gündem konusu güncellenemedi');
        } catch (error) {
            console.error('updateTrend error:', error.message);
            throw error;
        }
    }

    async deleteTrend(trendId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.delete(`${this.baseURL}/trends/${trendId}`, { headers });
            if (response.data && response.data.success) {
                return true;
            }
            throw new Error(response.data.message || 'Gündem konusu silinemedi');
        } catch (error) {
            console.error('deleteTrend error:', error.message);
            throw error;
        }
    }
}

module.exports = new ApiAdapter(); 
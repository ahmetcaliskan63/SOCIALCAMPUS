import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://socialcampus-production.up.railway.app";
// const BASE_URL = "http://localhost:3000"; // Geliştirme için

// Kullanıcı işlemleri
export const userService = {
  createUser: async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/kullanicilar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const text = await response.text();
      console.log("API Raw Response:", text);

      try {
        return JSON.parse(text);
      } catch (parseError) {
        if (response.ok) {
          return { success: true, data: userData };
        } else {
          throw new Error("Sunucu yanıtı geçersiz");
        }
      }
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  },

  getUser: async (userId) => {
    try {
      if (!userId) {
        throw new Error("Kullanıcı ID gerekli");
      }

      // Önce localStorage'dan veriyi al
      const storedData = await AsyncStorage.getItem("userData");
      if (!storedData) {
        throw new Error("Kullanıcı verisi bulunamadı");
      }

      const userData = JSON.parse(storedData);
      console.log("Mevcut localStorage verisi:", userData);

      // API'den veri almayı dene
      try {
        const response = await fetch(`${BASE_URL}/kullanici/${userId}`);
        if (response.ok) {
          const apiData = await response.json();
          console.log("API'den gelen veri:", apiData);

          // API verisi başarılı ise güncelle ve kaydet
          const updatedData = {
            ...userData,
            ...apiData,
            id: userId,
          };

          await AsyncStorage.setItem("userData", JSON.stringify(updatedData));
          return updatedData;
        }
      } catch (apiError) {
        console.log(
          "API bağlantısı başarısız, localStorage verisi kullanılıyor"
        );
      }

      // API'den veri alınamazsa localStorage verisini kullan
      return userData;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await fetch(`${BASE_URL}/kullanici/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  },

  getUsersByFaculty: async (faculty) => {
    try {
      const response = await fetch(
        `${BASE_URL}/kullanicilar/fakulte/${faculty}`
      );
      return await response.json();
    } catch (error) {
      console.error("Get users by faculty error:", error);
      throw error;
    }
  },
};

// Kitap işlemleri
export const bookService = {
  getAllBooks: async () => {
    try {
      const url = `${BASE_URL}/api/kitaplar`;
      console.log("API isteği yapılıyor:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("API yanıt status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log("API ham yanıt:", text);

      const data = JSON.parse(text);
      console.log("İşlenmiş veri:", data);

      if (data.success) {
        return data;
      } else {
        throw new Error(data.error || "Veri alınamadı");
      }
    } catch (error) {
      console.error("Kitapları getirme hatası:", error);
      throw error;
    }
  },

  createBook: async (bookData) => {
    try {
      console.log("Kitap ekleme isteği:", bookData);

      const response = await fetch(`${BASE_URL}/api/kitap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bookData),
      });

      const text = await response.text();
      console.log("API yanıtı:", text);

      const data = JSON.parse(text);

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      return data;
    } catch (error) {
      console.error("Kitap ekleme hatası:", error);
      throw error;
    }
  },

  getBook: async (bookId) => {
    try {
      const response = await fetch(`${BASE_URL}/kitaplar/${bookId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error("JSON Parse Error:", text);
        throw new Error("Sunucu yanıtı geçersiz format içeriyor");
      }
    } catch (error) {
      console.error("Get book error:", error);
      throw error;
    }
  },

  updateBook: async (bookId, bookData) => {
    try {
      const response = await fetch(`${BASE_URL}/kitaplar/${bookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });
      return await response.json();
    } catch (error) {
      console.error("Update book error:", error);
      throw error;
    }
  },

  deleteBook: async (bookId) => {
    try {
      console.log("Silinecek kitap ID:", bookId);

      const response = await fetch(`${BASE_URL}/api/kitap/${bookId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Delete book error:", error);
      throw error;
    }
  },

  getBooksByCategory: async (category) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/kitaplar/kategori/${category}`
      );
      if (!response.ok) {
        throw new Error("Veriler alınamadı");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get books by category error:", error);
      return [];
    }
  },

  getBooksByFaculty: async (faculty) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/kitaplar/fakulte/${faculty}`
      );
      if (!response.ok) {
        throw new Error("Veriler alınamadı");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get books by faculty error:", error);
      return [];
    }
  },
};

// Mesaj işlemleri
export const messageService = {
  createMessage: async (messageData) => {
    try {
      const response = await fetch(`${BASE_URL}/mesajlar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });
      return await response.json();
    } catch (error) {
      console.error("Create message error:", error);
      throw error;
    }
  },

  getAllMessages: async () => {
    try {
      const response = await fetch(`${BASE_URL}/mesajlar`);
      return await response.json();
    } catch (error) {
      console.error("Get all messages error:", error);
      throw error;
    }
  },

  getUserMessages: async (userId) => {
    try {
      const response = await fetch(`${BASE_URL}/mesajlar/kullanici/${userId}`);
      return await response.json();
    } catch (error) {
      console.error("Get user messages error:", error);
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const response = await fetch(`${BASE_URL}/mesajlar/${messageId}`, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      console.error("Delete message error:", error);
      throw error;
    }
  },
};

const db = require("../config/db");

class Message {
  static async create(messageData) {
    const { id, kullanici_id, kullanici_adi, icerik } = messageData;

    if (!kullanici_id || !icerik) {
      throw new Error(
        "Gerekli alanlar eksik: kullanici_id ve icerik zorunludur"
      );
    }

    try {
      // Veritabanı bağlantısını kontrol et
      await db.getConnection().ping();

      // Mesajı veritabanına ekle
      const [result] = await db.execute(
        "INSERT INTO mesajlar (id, kullanici_id, kullanici_adi, icerik) VALUES (?, ?, ?, ?)",
        [id, kullanici_id, kullanici_adi, icerik]
      );

      if (!result) {
        throw new Error("Mesaj oluşturulamadı");
      }

      // Oluşturulan mesajı sorgula
      const [newMessage] = await db.execute(
        "SELECT * FROM mesajlar WHERE id = ?",
        [id]
      );

      return newMessage[0];
    } catch (error) {
      console.error("Mesaj oluşturma hatası:", error);

      // Veritabanı bağlantı hataları için özel mesajlar
      if (error.code === "ECONNREFUSED") {
        throw new Error(
          "Veritabanına bağlanılamadı. Lütfen bağlantınızı kontrol edin."
        );
      }

      if (error.code === "ER_ACCESS_DENIED_ERROR") {
        throw new Error(
          "Veritabanı erişim hatası. Kullanıcı bilgilerini kontrol edin."
        );
      }

      throw new Error("Mesaj oluşturulurken bir hata oluştu: " + error.message);
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute("SELECT * FROM mesajlar WHERE id = ?", [
        id,
      ]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(kullanici_id) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM mesajlar WHERE kullanici_id = ? ORDER BY olusturma_tarihi DESC",
        [kullanici_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute("DELETE FROM mesajlar WHERE id = ?", [
        id,
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getAllMessages(limit = 50) {
    try {
      const [rows] = await db.query(
        "SELECT * FROM mesajlar ORDER BY olusturma_tarihi DESC LIMIT ?",
        [limit]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Message;

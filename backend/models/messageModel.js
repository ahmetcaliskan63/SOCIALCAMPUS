const db = require("../config/db");

class Message {
  static async create(messageData) {
    const { id, kullanici_id, kullanici_adi, icerik } = messageData;

    try {
      const [result] = await db.execute(
        "INSERT INTO mesajlar (id, kullanici_id, kullanici_adi, icerik) VALUES (?, ?, ?, ?)",
        [id, kullanici_id, kullanici_adi, icerik]
      );
      return result;
    } catch (error) {
      throw error;
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

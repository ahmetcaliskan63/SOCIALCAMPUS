const Message = require("../models/messageModel");
const { v4: uuidv4 } = require("uuid");
const { pool } = require("../config/db");

// Mesaj oluştur
const createMessage = async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // İstek verilerini kontrol et
    if (!req.body.icerik || !req.user || !req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Gerekli bilgiler eksik",
      });
    }

    const messageData = {
      id: uuidv4(),
      kullanici_id: req.user.id,
      kullanici_adi: req.user.tam_ad,
      icerik: req.body.icerik,
    };

    // Veritabanı bağlantısını kontrol et
    await connection.ping();

    // Mesajı oluştur
    const result = await Message.create(messageData);

    if (result) {
      return res.status(201).json({
        success: true,
        data: messageData,
      });
    }

    throw new Error("Mesaj oluşturulamadı");
  } catch (error) {
    console.error("Mesaj oluşturma hatası:", error);

    let errorMessage = "Mesaj gönderilirken bir hata oluştu";
    let statusCode = 500;

    if (error.code === 'ECONNREFUSED') {
      errorMessage = "Veritabanına bağlanılamıyor";
      statusCode = 503;
    } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      errorMessage = "Veritabanı bağlantısı koptu";
      statusCode = 503;
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Mesaj getir
const getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (message) {
      res.status(200).json({
        success: true,
        data: message,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Mesaj bulunamadı",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mesaj alınamadı",
      error: error.message,
    });
  }
};

// Kullanıcının mesajlarını getir
const getUserMessages = async (req, res) => {
  try {
    const messages = await Message.findByUserId(req.params.kullanici_id);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mesajlar alınamadı",
      error: error.message,
    });
  }
};

// Mesaj sil
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Mesaj bulunamadı",
      });
    }

    // Mesajı sadece sahibi silebilir
    if (message.kullanici_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bu işlem için yetkiniz yok",
      });
    }

    const result = await Message.delete(req.params.id);

    if (result.affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: "Mesaj başarıyla silindi",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Mesaj silinemedi",
      error: error.message,
    });
  }
};

// Tüm mesajları getir
const getAllMessages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const messages = await Message.getAllMessages(limit);

    if (!messages) {
      return res.status(404).json({
        success: false,
        message: "Mesaj bulunamadı",
      });
    }

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Controller error in getAllMessages:", error);
    res.status(500).json({
      success: false,
      message: "Mesajlar alınamadı",
      error: error.message,
    });
  }
};

module.exports = {
  createMessage,
  getMessage,
  getUserMessages,
  deleteMessage,
  getAllMessages,
};

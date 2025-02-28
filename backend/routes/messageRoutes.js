const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

// CORS headers
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Test endpoint'i
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Mesaj servisi çalışıyor" });
});

// Mesaj gönderme
router.post("/", async (req, res) => {
  try {
    console.log("Gelen mesaj verisi:", req.body);

    const { kullanici_id, kullanici_adi, icerik } = req.body;

    // Gerekli alanların kontrolü
    if (!kullanici_id || !kullanici_adi || !icerik) {
      console.log("Eksik alanlar:", { kullanici_id, kullanici_adi, icerik });
      return res.status(400).json({
        success: false,
        message: "Tüm alanları doldurun",
      });
    }

    const id = uuidv4();
    console.log("Yeni mesaj ID:", id);

    await db.query(
      "INSERT INTO mesajlar (id, kullanici_id, kullanici_adi, icerik) VALUES (?, ?, ?, ?)",
      [id, kullanici_id, kullanici_adi, icerik]
    );

    console.log("Mesaj başarıyla kaydedildi");

    res.status(201).json({
      success: true,
      data: {
        id,
        kullanici_id,
        kullanici_adi,
        icerik,
        olusturma_tarihi: new Date(),
      },
    });
  } catch (error) {
    console.error("Mesaj gönderme hatası detayları:", error);
    res.status(500).json({
      success: false,
      message: "Mesaj gönderilemedi",
      error: error.message,
    });
  }
});

// Tüm mesajları getirme
router.get("/", async (req, res) => {
  try {
    console.log("Mesajlar getiriliyor...");

    // Veritabanı bağlantısını kontrol et
    await db.query("SELECT 1");

    const [messages] = await db.query(
      `
      SELECT 
        m.*,
        (SELECT COUNT(*) FROM mesaj_begeniler WHERE mesaj_id = m.id) as likes,
        (SELECT COUNT(*) FROM mesaj_yorumlar WHERE mesaj_id = m.id) as comments,
        EXISTS(SELECT 1 FROM mesaj_begeniler WHERE mesaj_id = m.id AND kullanici_id = ?) as isLiked
      FROM mesajlar m 
      ORDER BY m.olusturma_tarihi DESC
    `,
      [req.query.kullanici_id || null]
    );

    console.log(`${messages.length} adet mesaj bulundu`);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Mesajlar getirilemedi",
        error: error.message,
      });
  }
});

// Kullanıcının mesajlarını getirme
router.get("/kullanici/:kullanici_id", async (req, res) => {
  try {
    const [messages] = await db.query(
      "SELECT * FROM mesajlar WHERE kullanici_id = ? ORDER BY olusturma_tarihi DESC",
      [req.params.kullanici_id]
    );

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get user messages error:", error);
    res
      .status(500)
      .json({ success: false, message: "Kullanıcı mesajları getirilemedi" });
  }
});

// Mesaj silme
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM mesajlar WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Mesaj bulunamadı",
      });
    }

    res.json({
      success: true,
      message: "Mesaj başarıyla silindi",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ success: false, message: "Mesaj silinemedi" });
  }
});

// Mesaj beğenme
router.post("/:id/like", async (req, res) => {
  try {
    const { kullanici_id } = req.body;
    const messageId = req.params.id;

    // Önce beğeni durumunu kontrol et
    const [likes] = await db.query(
      "SELECT * FROM mesaj_begeniler WHERE mesaj_id = ? AND kullanici_id = ?",
      [messageId, kullanici_id]
    );

    if (likes.length > 0) {
      // Beğeniyi kaldır
      await db.query(
        "DELETE FROM mesaj_begeniler WHERE mesaj_id = ? AND kullanici_id = ?",
        [messageId, kullanici_id]
      );
    } else {
      // Beğeni ekle
      await db.query(
        "INSERT INTO mesaj_begeniler (mesaj_id, kullanici_id) VALUES (?, ?)",
        [messageId, kullanici_id]
      );
    }

    // Güncel beğeni sayısını al
    const [result] = await db.query(
      "SELECT COUNT(*) as likes FROM mesaj_begeniler WHERE mesaj_id = ?",
      [messageId]
    );

    res.json({
      success: true,
      data: {
        likes: result[0].likes,
        isLiked: likes.length === 0, // Eğer beğeni yoktu ve eklediyse true, vardı ve sildiyse false
      },
    });
  } catch (error) {
    console.error("Like message error:", error);
    res
      .status(500)
      .json({ success: false, message: "Beğeni işlemi başarısız oldu" });
  }
});

// Mesaja yorum ekleme
router.post("/:id/comments", async (req, res) => {
  try {
    const messageId = req.params.id;
    const { kullanici_id, kullanici_adi, icerik } = req.body;

    if (!kullanici_id || !kullanici_adi || !icerik) {
      return res.status(400).json({
        success: false,
        message: "Tüm alanları doldurun",
      });
    }

    const id = uuidv4();
    await db.query(
      "INSERT INTO mesaj_yorumlar (id, mesaj_id, kullanici_id, kullanici_adi, icerik) VALUES (?, ?, ?, ?, ?)",
      [id, messageId, kullanici_id, kullanici_adi, icerik]
    );

    res.status(201).json({
      success: true,
      data: {
        id,
        mesaj_id: messageId,
        kullanici_id,
        kullanici_adi,
        icerik,
        olusturma_tarihi: new Date(),
      },
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Yorum eklenemedi" });
  }
});

// Mesajın yorumlarını getirme
router.get("/:id/comments", async (req, res) => {
  try {
    console.log("Yorumlar getiriliyor, mesaj ID:", req.params.id);
    console.log("Kullanıcı ID:", req.query.kullanici_id);

    const [comments] = await db.query(
      `
      SELECT 
        y.*,
        (SELECT COUNT(*) FROM mesaj_yorum_begeniler WHERE yorum_id = y.id) as likes,
        EXISTS(SELECT 1 FROM mesaj_yorum_begeniler WHERE yorum_id = y.id AND kullanici_id = ?) as isLiked
      FROM mesaj_yorumlar y
      WHERE y.mesaj_id = ?
      ORDER BY y.olusturma_tarihi DESC
    `,
      [req.query.kullanici_id || null, req.params.id]
    );

    console.log(`${comments.length} adet yorum bulundu`);

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Yorumları getirme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Yorumlar getirilemedi",
      error: error.message,
    });
  }
});

// Gündem konularını getir
router.get("/gundem_konulari", async (req, res) => {
  try {
    console.log("Gündem konuları getirme isteği alındı");

    // Veritabanı bağlantısını kontrol et
    await db.query("SELECT 1");

    const [topics] = await db.query(
      "SELECT * FROM gundem_konulari ORDER BY siralama ASC, olusturma_tarihi DESC"
    );

    console.log(`${topics.length} adet gündem konusu bulundu`);

    res.json({
      success: true,
      data: topics,
    });
  } catch (error) {
    console.error("Gündem konuları getirilirken hata:", error);
    res.status(500).json({
      success: false,
      message: "Gündem konuları getirilemedi",
      error: error.message,
    });
  }
});

// Yemek değerlendirme endpoint'leri
router.post("/yemek-degerlendirme", async (req, res) => {
  try {
    const { yemek_tarihi, kullanici_id, durum, islem } = req.body;

    if (islem === "remove") {
      // Değerlendirmeyi sil
      await db.query(
        "DELETE FROM yemek_degerlendirme WHERE yemek_tarihi = ? AND kullanici_id = ?",
        [yemek_tarihi, kullanici_id]
      );
    } else {
      // Önce mevcut değerlendirmeyi kontrol et
      const [existingRating] = await db.query(
        "SELECT id FROM yemek_degerlendirme WHERE yemek_tarihi = ? AND kullanici_id = ?",
        [yemek_tarihi, kullanici_id]
      );

      if (existingRating.length > 0) {
        // Mevcut değerlendirmeyi güncelle
        await db.query(
          "UPDATE yemek_degerlendirme SET durum = ? WHERE yemek_tarihi = ? AND kullanici_id = ?",
          [durum, yemek_tarihi, kullanici_id]
        );
      } else {
        // Yeni değerlendirme ekle
        await db.query(
          "INSERT INTO yemek_degerlendirme (yemek_tarihi, kullanici_id, durum) VALUES (?, ?, ?)",
          [yemek_tarihi, kullanici_id, durum]
        );
      }
    }

    // Güncel istatistikleri getir
    const [stats] = await db.query(
      `SELECT 
        COUNT(CASE WHEN durum = true THEN 1 END) as begeni_sayisi,
        COUNT(CASE WHEN durum = false THEN 1 END) as begenmeme_sayisi
      FROM yemek_degerlendirme 
      WHERE yemek_tarihi = ?`,
      [yemek_tarihi]
    );

    res.json({
      success: true,
      begeni_sayisi: stats[0].begeni_sayisi || 0,
      begenmeme_sayisi: stats[0].begenmeme_sayisi || 0,
    });
  } catch (error) {
    console.error("Yemek değerlendirme hatası:", error);
    res
      .status(500)
      .json({ success: false, error: "Değerlendirme kaydedilemedi" });
  }
});

// Yemek değerlendirme istatistiklerini getir
router.get("/yemek-degerlendirme/istatistikler", async (req, res) => {
  try {
    const [stats] = await db.query(
      `SELECT 
        yemek_tarihi,
        COUNT(CASE WHEN durum = true THEN 1 END) as begeni_sayisi,
        COUNT(CASE WHEN durum = false THEN 1 END) as begenmeme_sayisi
      FROM yemek_degerlendirme 
      GROUP BY yemek_tarihi`
    );

    res.json(stats);
  } catch (error) {
    console.error("İstatistik getirme hatası:", error);
    res.status(500).json({ success: false, error: "İstatistikler alınamadı" });
  }
});

// Kullanıcının değerlendirmelerini getir
router.get("/yemek-degerlendirme/kullanici/:kullanici_id", async (req, res) => {
  try {
    const { kullanici_id } = req.params;

    const [ratings] = await db.query(
      "SELECT yemek_tarihi, durum FROM yemek_degerlendirme WHERE kullanici_id = ?",
      [kullanici_id]
    );

    res.json(ratings);
  } catch (error) {
    console.error("Kullanıcı değerlendirmeleri getirme hatası:", error);
    res
      .status(500)
      .json({ success: false, error: "Kullanıcı değerlendirmeleri alınamadı" });
  }
});

// Geçmiş yemek değerlendirmelerini temizle
router.delete("/yemek-degerlendirme/temizle-gecmis", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Bugünden önceki tüm değerlendirmeleri sil
    const [result] = await db.query(
      "DELETE FROM yemek_degerlendirme WHERE yemek_tarihi < ?",
      [today.toISOString().split("T")[0]]
    );

    console.log("Silinen değerlendirme sayısı:", result.affectedRows);

    res.json({
      success: true,
      message: `${result.affectedRows} adet geçmiş değerlendirme silindi`,
    });
  } catch (error) {
    console.error("Geçmiş değerlendirmeleri silme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Geçmiş değerlendirmeler silinemedi",
    });
  }
});

// Yorum beğenme
router.post("/:messageId/comments/:commentId/like", async (req, res) => {
  try {
    const { messageId, commentId } = req.params;
    const { kullanici_id } = req.body;

    if (!kullanici_id) {
      return res.status(400).json({
        success: false,
        message: "Kullanıcı ID gerekli",
      });
    }

    // Önce beğeni durumunu kontrol et
    const [likes] = await db.query(
      "SELECT * FROM mesaj_yorum_begeniler WHERE yorum_id = ? AND kullanici_id = ?",
      [commentId, kullanici_id]
    );

    if (likes.length > 0) {
      // Beğeniyi kaldır
      await db.query(
        "DELETE FROM mesaj_yorum_begeniler WHERE yorum_id = ? AND kullanici_id = ?",
        [commentId, kullanici_id]
      );
    } else {
      // Beğeni ekle
      await db.query(
        "INSERT INTO mesaj_yorum_begeniler (yorum_id, kullanici_id) VALUES (?, ?)",
        [commentId, kullanici_id]
      );
    }

    // Güncel beğeni sayısını al
    const [result] = await db.query(
      "SELECT COUNT(*) as likes FROM mesaj_yorum_begeniler WHERE yorum_id = ?",
      [commentId]
    );

    // Kullanıcının beğeni durumunu kontrol et
    const [userLike] = await db.query(
      "SELECT 1 FROM mesaj_yorum_begeniler WHERE yorum_id = ? AND kullanici_id = ?",
      [commentId, kullanici_id]
    );

    res.json({
      success: true,
      data: {
        likes: result[0].likes,
        isLiked: userLike.length > 0,
      },
    });
  } catch (error) {
    console.error("Yorum beğenme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Beğeni işlemi başarısız oldu",
      error: error.message,
    });
  }
});

// Yorum silme
router.delete("/:messageId/comments/:commentId", async (req, res) => {
  try {
    const { messageId, commentId } = req.params;

    // Önce yorumun var olup olmadığını kontrol et
    const [comment] = await db.query(
      "SELECT * FROM mesaj_yorumlar WHERE id = ? AND mesaj_id = ?",
      [commentId, messageId]
    );

    if (comment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Yorum bulunamadı",
      });
    }

    // Yorumu sil
    await db.query("DELETE FROM mesaj_yorumlar WHERE id = ?", [commentId]);

    // Yorum beğenilerini de sil
    await db.query("DELETE FROM mesaj_yorum_begeniler WHERE yorum_id = ?", [
      commentId,
    ]);

    res.json({
      success: true,
      message: "Yorum başarıyla silindi",
    });
  } catch (error) {
    console.error("Yorum silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Yorum silinemedi",
      error: error.message,
    });
  }
});

module.exports = router;

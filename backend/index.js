const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const app = express();

// CORS ayarlarını güncelle
app.use(
  cors({
    origin: [
      "http://localhost:19006",
      "http://localhost:19000",
      "exp://192.168.1.144:8081",
      "https://klucampus-production.up.railway.app",
      "https://*.railway.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  })
);

// Timeout middleware ekle
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 saniye
  res.setTimeout(30000);
  next();
});

// Hata yakalama middleware'ini güncelle
app.use((err, req, res, next) => {
  console.error("Hata detayı:", {
    hataKodu: err.code,
    hataMesaji: err.message,
    yol: req.path,
    metod: req.method,
  });

  // Network hatalarını yakala
  if (err.code === "ECONNRESET" || err.code === "ECONNABORTED") {
    return res.status(503).json({
      success: false,
      error: "Bağlantı hatası",
      message: "Sunucu bağlantısı kesildi, lütfen tekrar deneyin",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: "İşlem başarısız",
    message: err.message || "Sunucu hatası oluştu",
  });
});

// Mesaj endpoint'lerini güncelle
app.get("/api/messages", async (req, res) => {
  try {
    const [messages] = await db.query(
      `SELECT 
        m.*, 
        COUNT(mb.mesaj_id) as begeni_sayisi 
      FROM mesajlar m 
      LEFT JOIN mesaj_begeniler mb ON m.id = mb.mesaj_id 
      GROUP BY m.id 
      ORDER BY m.olusturma_tarihi DESC 
      LIMIT 50`
    );

    if (!messages) {
      return res.status(404).json({
        success: false,
        message: "Mesaj bulunamadı",
      });
    }

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Mesaj getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Mesajlar alınamadı",
      message: "Sunucu hatası oluştu, lütfen tekrar deneyin",
    });
  }
});

// Mesaj oluşturma endpoint'ini güncelle
app.post("/api/messages", async (req, res) => {
  try {
    if (!req.body.icerik || !req.body.kullanici_id) {
      return res.status(400).json({
        success: false,
        message: "Gerekli alanlar eksik",
      });
    }

    const messageData = {
      id: req.body.id,
      kullanici_id: req.body.kullanici_id,
      kullanici_adi: req.body.kullanici_adi,
      icerik: req.body.icerik,
    };

    const [result] = await db.query("INSERT INTO mesajlar SET ?", [
      messageData,
    ]);

    res.status(201).json({
      success: true,
      message: "Mesaj başarıyla oluşturuldu",
      data: { ...messageData, id: result.insertId },
    });
  } catch (error) {
    console.error("Mesaj oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      error: "Mesaj oluşturulamadı",
      message: "Sunucu hatası oluştu, lütfen tekrar deneyin",
    });
  }
});

app.use(express.json());

// Debug için tüm gelen istekleri logla
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API durumunu kontrol et
app.get("/", (req, res) => {
  res.json({ status: "API is running" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "KLU Campus API çalışıyor",
    version: "1.0.0",
  });
});

// Kitap route'larını ekle
const kitaplarRoutes = require("./routes/kitaplar");
app.use("/api", kitaplarRoutes);

// Test endpoint
app.get("/test", async (req, res) => {
  try {
    // Veritabanı bağlantısını test et
    const [result] = await db.execute("SELECT 1");
    res.json({
      message: "API ve veritabanı çalışıyor",
      dbTest: result,
    });
  } catch (error) {
    res.status(500).json({
      error: "Veritabanı bağlantı hatası",
      details: error.message,
    });
  }
});

// Kullanıcı oluşturma endpoint'i
app.post("/kullanicilar", async (req, res) => {
  try {
    console.log("Ham veri detayları:", req.body);

    const userData = {
      tam_ad: req.body.tam_ad,
      fakulte: req.body.fakulte,
      fakulte_adi: req.body.fakulte_adi,
      bolum: req.body.bolum,
      sartlari_kabul: req.body.sartlari_kabul ? 1 : 0,
      sozlesmeyi_kabul: req.body.sozlesmeyi_kabul ? 1 : 0,
    };

    console.log("Dönüştürülmüş veri:", userData);

    // Promise pool kullanarak direkt sorgu yap
    const [result] = await db.query(
      "INSERT INTO kullanicilar (tam_ad, fakulte, fakulte_adi, bolum, sartlari_kabul, sozlesmeyi_kabul) VALUES (?, ?, ?, ?, ?, ?)",
      [
        userData.tam_ad,
        userData.fakulte,
        userData.fakulte_adi,
        userData.bolum,
        userData.sartlari_kabul,
        userData.sozlesmeyi_kabul,
      ]
    );

    const [users] = await db.query("SELECT * FROM kullanicilar WHERE id = ?", [
      result.insertId,
    ]);

    res.json({
      success: true,
      message: "Kullanıcı oluşturuldu",
      data: users[0],
    });
  } catch (error) {
    console.error("Detaylı hata:", error);
    res.status(500).json({
      success: false,
      error: "Kullanıcı oluşturulamadı",
      message: error.message,
    });
  }
});

// Mesaj oluşturma endpoint'i
app.post("/api/messages", async (req, res) => {
  try {
    const messageData = {
      id: req.body.id,
      kullanici_id: req.body.kullanici_id,
      kullanici_adi: req.body.kullanici_adi,
      icerik: req.body.icerik,
    };

    const [result] = await db.query(
      "INSERT INTO mesajlar (id, kullanici_id, kullanici_adi, icerik) VALUES (?, ?, ?, ?)",
      [
        messageData.id,
        messageData.kullanici_id,
        messageData.kullanici_adi,
        messageData.icerik,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Mesaj oluşturuldu",
      data: messageData,
    });
  } catch (error) {
    console.error("Mesaj oluşturma hatası:", error);
    res.status(500).json({
      success: false,
      error: "Mesaj oluşturulamadı",
      message: error.message,
    });
  }
});

// Tüm mesajları getirme endpoint'i
app.get("/api/messages", async (req, res) => {
  try {
    const [messages] = await db.query(
      "SELECT m.*, COUNT(mb.mesaj_id) as begeni_sayisi FROM mesajlar m " +
        "LEFT JOIN mesaj_begeniler mb ON m.id = mb.mesaj_id " +
        "GROUP BY m.id " +
        "ORDER BY m.olusturma_tarihi DESC"
    );

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Mesaj getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Mesajlar alınamadı",
      message: error.message,
    });
  }
});

// Kullanıcının mesajlarını getirme endpoint'i
app.get("/api/messages/user/:kullanici_id", async (req, res) => {
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
    console.error("Kullanıcı mesajları getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kullanıcı mesajları alınamadı",
      message: error.message,
    });
  }
});

// Mesaj silme endpoint'i
app.delete("/api/messages/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM mesajlar WHERE id = ? AND kullanici_id = ?",
      [req.params.id, req.body.kullanici_id]
    );

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "Mesaj başarıyla silindi",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Mesaj bulunamadı veya silme yetkisi yok",
      });
    }
  } catch (error) {
    console.error("Mesaj silme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Mesaj silinemedi",
      message: error.message,
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Hata yakalandı:", err);
  res.status(500).json({
    error: "Bir hata oluştu!",
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;

// Sunucuyu başlat
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
});

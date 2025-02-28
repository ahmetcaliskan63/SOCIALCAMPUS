const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const app = express();

// CORS ayarları
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'KLU Campus API çalışıyor',
    version: '1.0.0'
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
      sozlesmeyi_kabul: req.body.sozlesmeyi_kabul ? 1 : 0
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
        userData.sozlesmeyi_kabul
      ]
    );

    const [users] = await db.query(
      "SELECT * FROM kullanicilar WHERE id = ?",
      [result.insertId]
    );

    res.json({
      success: true,
      message: "Kullanıcı oluşturuldu",
      data: users[0]
    });

  } catch (error) {
    console.error("Detaylı hata:", error);
    res.status(500).json({
      success: false,
      error: "Kullanıcı oluşturulamadı",
      message: error.message
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

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
    // Gelen ham veriyi detaylı logla
    console.log("Ham veri detayları:", req.body);

    // Veriyi kontrol et ve alan isimlerini eşleştir
    const userData = {
      tam_ad: req.body.tam_ad || "",
      fakulte: req.body.faculty || "", // faculty -> fakulte
      fakulte_adi: req.body.faculty || "", // faculty -> fakulte_adi
      bolum: req.body.department || "", // department -> bolum
      sartlari_kabul: req.body.termsAccepted ? 1 : 0, // termsAccepted -> sartlari_kabul
      sozlesmeyi_kabul: req.body.eulaAccepted ? 1 : 0, // eulaAccepted -> sozlesmeyi_kabul
    };

    console.log("Dönüştürülmüş veri:", userData);

    // Veritabanı sorgusu
    const [result] = await db.execute(
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

    console.log("Insert result:", result);

    // Oluşturulan kullanıcının bilgilerini al
    const [users] = await db.execute(
      "SELECT * FROM kullanicilar WHERE id = ?",
      [result.insertId]
    );

    res.json({
      success: true,
      message: "Kullanıcı oluşturuldu",
      data: users[0],
    });
  } catch (error) {
    console.error("Detaylı hata:", error);
    res.status(500).json({
      error: error.message,
      details: "Sunucu hatası oluştu",
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

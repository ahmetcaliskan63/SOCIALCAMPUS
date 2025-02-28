const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../config/database");

// CORS middleware ekle
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Kitap ekleme
router.post("/", async (req, res) => {
  try {
    const {
      baslik,
      kategori,
      fiyat,
      instagram,
      resim_url,
      satici_id,
      satici_adi,
      satici_fakulte,
      satici_bolum,
    } = req.body;

    // Zorunlu alanları kontrol et
    if (!baslik || !kategori || !fiyat || !satici_id) {
      return res.status(400).json({
        success: false,
        message: "Eksik bilgi gönderildi",
      });
    }

    const id = uuidv4();

    const [result] = await db.query(
      `INSERT INTO kitaplar (
        id, baslik, kategori, fiyat, instagram, resim_url,
        satici_id, satici_adi, satici_fakulte, satici_bolum, durum
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        baslik,
        kategori,
        fiyat,
        instagram,
        resim_url,
        satici_id,
        satici_adi,
        satici_fakulte,
        satici_bolum,
        "müsait",
      ]
    );

    if (result.affectedRows > 0) {
      const [newBook] = await db.query("SELECT * FROM kitaplar WHERE id = ?", [
        id,
      ]);

      res.status(201).json({
        success: true,
        data: newBook[0],
      });
    } else {
      throw new Error("Kitap eklenemedi");
    }
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({
      success: false,
      message: "Kitap eklenemedi",
      error: error.message,
    });
  }
});

// Kitap listesi
router.get("/", async (req, res) => {
  try {
    console.log("Kitaplar getirme isteği alındı");

    // Veritabanı bağlantısını kontrol et
    await db.query("SELECT 1");

    const [books] = await db.query(
      "SELECT * FROM kitaplar ORDER BY olusturma_tarihi DESC"
    );
    console.log(`${books.length} adet kitap bulundu`);

    res.header("Access-Control-Allow-Origin", "*");
    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({
      success: false,
      message: "Kitaplar getirilemedi",
      error: error.message,
    });
  }
});

// Kitap detayı
router.get("/:id", async (req, res) => {
  try {
    const [books] = await db.query("SELECT * FROM kitaplar WHERE id = ?", [
      req.params.id,
    ]);

    if (books.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadı" });
    }

    res.json({
      success: true,
      data: books[0],
    });
  } catch (error) {
    console.error("Get book error:", error);
    res
      .status(500)
      .json({ success: false, message: "Kitap bilgileri alınamadı" });
  }
});

// Kitap güncelleme
router.put("/:id", async (req, res) => {
  try {
    const { baslik, kategori, fiyat, instagram, resim_url, durum } = req.body;

    await db.query(
      `UPDATE kitaplar 
       SET baslik = ?, kategori = ?, fiyat = ?, 
           instagram = ?, resim_url = ?, durum = ?
       WHERE id = ?`,
      [baslik, kategori, fiyat, instagram, resim_url, durum, req.params.id]
    );

    res.json({
      success: true,
      data: {
        id: req.params.id,
        baslik,
        kategori,
        fiyat,
        instagram,
        resim_url,
        durum,
      },
    });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ success: false, message: "Kitap güncellenemedi" });
  }
});

// Kitap silme
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM kitaplar WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Kitap bulunamadı" });
    }

    res.json({
      success: true,
      message: "Kitap başarıyla silindi",
    });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ success: false, message: "Kitap silinemedi" });
  }
});

// Kategoriye göre kitapları getirme
router.get("/kategori/:kategori", async (req, res) => {
  try {
    const [books] = await db.query(
      "SELECT * FROM kitaplar WHERE kategori = ?",
      [req.params.kategori]
    );

    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Get books by category error:", error);
    res.status(500).json({ success: false, message: "Kitaplar getirilemedi" });
  }
});

// Fakülteye göre kitapları getirme
router.get("/fakulte/:fakulte", async (req, res) => {
  try {
    const [books] = await db.query(
      "SELECT * FROM kitaplar WHERE satici_fakulte = ?",
      [req.params.fakulte]
    );

    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Get books by faculty error:", error);
    res.status(500).json({ success: false, message: "Kitaplar getirilemedi" });
  }
});

// Fiyat aralığına göre kitapları getirme
router.get("/fiyat", async (req, res) => {
  try {
    const { min, max } = req.query;

    if (!min || !max) {
      return res.status(400).json({
        success: false,
        message: "Minimum ve maximum fiyat değerleri gerekli",
      });
    }

    const [books] = await db.query(
      "SELECT * FROM kitaplar WHERE fiyat BETWEEN ? AND ?",
      [min, max]
    );

    res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error("Get books by price range error:", error);
    res.status(500).json({ success: false, message: "Kitaplar getirilemedi" });
  }
});

module.exports = router;

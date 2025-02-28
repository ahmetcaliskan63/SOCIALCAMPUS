const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Debug için route'ları logla
router.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Route'ları logla
console.log("Kitaplar route'ları yüklendi");
console.log("GET /api/kitaplar");
console.log("GET /api/books");
console.log("POST /api/kitap");

// Tüm kitapları getir
router.get("/kitaplar", async (req, res) => {
  console.log("GET /api/kitaplar isteği alındı");
  try {
    // Veritabanı bağlantısını kontrol et
    await db.execute("SELECT 1");
    console.log("Veritabanı bağlantısı OK");

    // Kitapları getir - JOIN olmadan
    const [kitaplar] = await db.execute(`
      SELECT * FROM kitaplar 
      ORDER BY created_at DESC
    `);

    console.log("Sorgu başarılı, kitap sayısı:", kitaplar.length);

    res.json({
      success: true,
      data: kitaplar,
      message: kitaplar.length === 0 ? "Henüz kitap bulunmuyor" : undefined,
    });
  } catch (error) {
    console.error("Kitapları getirme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kitaplar alınırken bir hata oluştu",
      details: error.message,
    });
  }
});

// Kitap ekleme
router.post("/kitap", async (req, res) => {
  try {
    console.log("Gelen kitap verisi:", req.body);

    // Frontend'den gelen veriyi backend formatına dönüştür
    const kitapData = {
      baslik: req.body.baslik,
      kategori: req.body.kategori?.toLowerCase() || "diger",
      fiyat: Number(req.body.fiyat),
      instagram: req.body.instagram || "",
      resim_url: req.body.resim_url || "",
      kullanici_id: req.body.satici_id?.toString(),
      satici_adi: req.body.satici_adi || "",
      satici_fakulte: req.body.satici_fakulte?.toLowerCase() || "",
      satici_bolum: req.body.satici_bolum || "",
    };

    // Veri doğrulama
    if (!kitapData.baslik || !kitapData.fiyat || !kitapData.kullanici_id) {
      return res.status(400).json({
        success: false,
        error: "Gerekli alanlar eksik",
        required: ["baslik", "fiyat", "satici_id"],
        received: req.body,
      });
    }

    // SQL sorgusunu hazırla
    const sql = `
      INSERT INTO kitaplar 
      (baslik, kategori, fiyat, instagram, resim_url, kullanici_id, satici_adi, satici_fakulte, satici_bolum) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      kitapData.baslik,
      kitapData.kategori,
      kitapData.fiyat,
      kitapData.instagram,
      kitapData.resim_url,
      kitapData.kullanici_id,
      kitapData.satici_adi,
      kitapData.satici_fakulte,
      kitapData.satici_bolum,
    ];

    console.log("SQL:", sql);
    console.log("Values:", values);

    // Veritabanına kaydet
    const [result] = await db.execute(sql, values);

    // Eklenen kitabı getir
    const [kitap] = await db.execute("SELECT * FROM kitaplar WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      data: kitap[0],
      message: "Kitap başarıyla eklendi",
    });
  } catch (error) {
    console.error("Kitap ekleme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kitap eklenirken bir hata oluştu",
      details: error.message,
    });
  }
});

// Kategori bazlı kitapları getir
router.get("/kitaplar/kategori/:kategori", async (req, res) => {
  try {
    const [kitaplar] = await db.execute(
      "SELECT * FROM kitaplar WHERE kategori = ? ORDER BY created_at DESC",
      [req.params.kategori.toLowerCase()]
    );
    res.json(kitaplar);
  } catch (error) {
    console.error("Kategori bazlı kitapları getirme hatası:", error);
    res.status(500).json({ error: "Kitaplar alınırken bir hata oluştu" });
  }
});

// Fakülte bazlı kitapları getir
router.get("/kitaplar/fakulte/:fakulte", async (req, res) => {
  try {
    const [kitaplar] = await db.execute(
      "SELECT * FROM kitaplar WHERE fakulte = ? ORDER BY created_at DESC",
      [req.params.fakulte.toLowerCase()]
    );
    res.json(kitaplar);
  } catch (error) {
    console.error("Fakülte bazlı kitapları getirme hatası:", error);
    res.status(500).json({ error: "Kitaplar alınırken bir hata oluştu" });
  }
});

// Kitap silme route'u - route yolunu düzelttik
router.delete("/kitap/:id", async (req, res) => {
  // "/kitaplar/:id" yerine "/kitap/:id"
  try {
    console.log("Silinecek kitap ID:", req.params.id);

    // Önce kitabın var olduğunu kontrol et
    const [kitap] = await db.execute("SELECT * FROM kitaplar WHERE id = ?", [
      req.params.id,
    ]);

    if (kitap.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Kitap bulunamadı",
      });
    }

    // Kitabı sil
    const [result] = await db.execute("DELETE FROM kitaplar WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows > 0) {
      res.json({
        success: true,
        message: "Kitap başarıyla silindi",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Kitap silinemedi",
      });
    }
  } catch (error) {
    console.error("Kitap silme hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kitap silinirken bir hata oluştu",
      details: error.message,
    });
  }
});

module.exports = router;

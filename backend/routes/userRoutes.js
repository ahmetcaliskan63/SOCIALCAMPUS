const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// CORS middleware ekle
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Content-Type', 'application/json');
  next();
});

// Test endpoint'i
router.get('/test', (req, res) => {
  res.json({ message: 'API çalışıyor' });
});

// Kullanıcı bilgilerini getirme
router.get('/:id', async (req, res) => {
  try {
    console.log('Kullanıcı ID:', req.params.id);
    
    const [users] = await db.query(
      'SELECT id, tam_ad, fakulte, fakulte_adi, bolum FROM kullanicilar WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      console.log('Kullanıcı bulunamadı');
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
    }

    console.log('Bulunan kullanıcı:', users[0]);
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kullanıcı bilgileri alınamadı' 
    });
  }
});

// Kullanıcı güncelleme
router.put('/:id', async (req, res) => {
  try {
    console.log('Güncelleme isteği:', {
      userId: req.params.id,
      body: req.body
    });

    const userId = req.params.id;
    const updateData = req.body;

    // Mevcut kullanıcı bilgilerini al
    const [currentUser] = await db.query(
      'SELECT tam_ad, fakulte, bolum FROM kullanicilar WHERE id = ?',
      [userId]
    );

    if (currentUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Güncellenecek alanları belirle
    const updates = {
      tam_ad: updateData.tam_ad || currentUser[0].tam_ad,
      fakulte: updateData.fakulte || currentUser[0].fakulte,
      bolum: updateData.bolum || currentUser[0].bolum
    };

    console.log('Güncellenecek veriler:', updates);

    // Güncelleme sorgusunu oluştur ve çalıştır
    const updateResult = await db.query(
      `UPDATE kullanicilar 
       SET tam_ad = ?, fakulte = ?, bolum = ?
       WHERE id = ?`,
      [updates.tam_ad, updates.fakulte, updates.bolum, userId]
    );

    console.log('Update sonucu:', updateResult[0]);

    if (updateResult[0].affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Güncelleme yapılamadı'
      });
    }

    // Güncellenmiş kullanıcı bilgilerini getir
    const [updatedUser] = await db.query(
      'SELECT id, tam_ad, fakulte, bolum FROM kullanicilar WHERE id = ?',
      [userId]
    );

    console.log('Güncellenmiş kullanıcı:', updatedUser[0]);

    res.json({
      success: true,
      message: 'Kullanıcı bilgileri güncellendi',
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Kullanıcı güncellenemedi',
      error: error.message 
    });
  }
});

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  try {
    // Gelen veriyi detaylı logla
    console.log('Register isteği detayları:', {
      tumVeri: req.body,
      tamAd: {
        deger: req.body.tam_ad,
        tip: typeof req.body.tam_ad,
        uzunluk: req.body.tam_ad ? req.body.tam_ad.length : 0,
        boslukVarMi: req.body.tam_ad ? req.body.tam_ad.includes(' ') : false
      },
      fakulte: req.body.fakulte,
      bolum: req.body.bolum,
      sartlar: req.body.sartlari_kabul,
      sozlesme: req.body.sozlesmeyi_kabul
    });

    const {
      tam_ad,
      fakulte,
      fakulte_adi,
      bolum,
      sartlari_kabul,
      sozlesmeyi_kabul
    } = req.body;

    // tam_ad özel kontrolü
    if (!tam_ad || typeof tam_ad !== 'string' || tam_ad.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ad Soyad alanı geçerli bir değer olmalıdır'
      });
    }

    // Diğer zorunlu alanları kontrol et
    if (!fakulte || !fakulte_adi || !bolum) {
      return res.status(400).json({
        success: false,
        message: 'Tüm zorunlu alanları doldurun'
      });
    }

    // Switch değerlerini kontrol et
    if (sartlari_kabul !== 1 || sozlesmeyi_kabul !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen sözleşmeleri kabul edin'
      });
    }

    // UUID oluştur
    const id = uuidv4();

    // SQL sorgusunu hazırla
    const sql = `
      INSERT INTO kullanicilar 
      (id, tam_ad, fakulte, fakulte_adi, bolum, sartlari_kabul, sozlesmeyi_kabul) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // Parametreleri hazırla
    const values = [
      id,
      tam_ad,
      fakulte,
      fakulte_adi,
      bolum,
      sartlari_kabul,
      sozlesmeyi_kabul
    ];

    // SQL sorgusunu logla
    console.log('SQL:', sql);
    console.log('Değerler:', values);

    // Veritabanına kaydet
    await db.query(sql, values);

    // Başarılı yanıt döndür
    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi',
      data: {
        userId: id
      }
    });

  } catch (error) {
    // Hata detaylarını logla
    console.error('Kayıt hatası:', error);

    // MySQL hata kodlarını kontrol et
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı zaten kayıtlı'
      });
    }

    // Genel hata yanıtı
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası oluştu',
      error: error.message
    });
  }
});

module.exports = router; 
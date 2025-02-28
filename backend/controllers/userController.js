const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Kullanıcı oluşturma
const createUser = async (req, res) => {
  try {
    const { tam_ad, fakulte, fakulte_adi, bolum, sartlari_kabul, sozlesmeyi_kabul } = req.body;

    // Gerekli alanların kontrolü
    if (!tam_ad || !fakulte || !fakulte_adi || !bolum) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tüm zorunlu alanları doldurun' 
      });
    }

    // Kullanıcı ID'si oluştur
    const id = uuidv4();

    // Kullanıcı oluşturma
    const [result] = await db.query(
      'INSERT INTO kullanicilar (id, tam_ad, fakulte, fakulte_adi, bolum, sartlari_kabul, sozlesmeyi_kabul) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, tam_ad, fakulte, fakulte_adi, bolum, sartlari_kabul || false, sozlesmeyi_kabul || false]
    );

    res.status(201).json({
      success: true,
      data: {
        id,
        tam_ad,
        fakulte,
        fakulte_adi,
        bolum,
        sartlari_kabul,
        sozlesmeyi_kabul
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Kullanıcı oluşturulamadı' });
  }
};

// Kullanıcı bilgilerini getirme
const getUser = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT * FROM kullanicilar WHERE id = ?',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Kullanıcı bilgileri alınamadı' });
  }
};

// Kullanıcı güncelleme
const updateUser = async (req, res) => {
  try {
    const { tam_ad, fakulte, fakulte_adi, bolum, sartlari_kabul, sozlesmeyi_kabul } = req.body;
    const userId = req.params.id;

    await db.query(
      `UPDATE kullanicilar 
       SET tam_ad = ?, fakulte = ?, fakulte_adi = ?, bolum = ?, 
           sartlari_kabul = ?, sozlesmeyi_kabul = ?
       WHERE id = ?`,
      [tam_ad, fakulte, fakulte_adi, bolum, sartlari_kabul, sozlesmeyi_kabul, userId]
    );

    res.json({
      success: true,
      data: { 
        id: userId,
        tam_ad, 
        fakulte, 
        fakulte_adi, 
        bolum, 
        sartlari_kabul, 
        sozlesmeyi_kabul 
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Kullanıcı güncellenemedi' });
  }
};

// Kullanıcı silme
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const [result] = await db.query('DELETE FROM kullanicilar WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Kullanıcı silinemedi' });
  }
};

// Fakülteye göre kullanıcıları getirme
const getUsersByFaculty = async (req, res) => {
  try {
    const fakulte = req.params.fakulte;
    
    const [users] = await db.query(
      'SELECT * FROM kullanicilar WHERE fakulte = ?',
      [fakulte]
    );

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users by faculty error:', error);
    res.status(500).json({ success: false, message: 'Kullanıcılar getirilemedi' });
  }
};

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getUsersByFaculty
}; 
-- Veritabanını oluştur (eğer yoksa)
CREATE DATABASE IF NOT EXISTS klucampus;
USE klucampus;

-- Mevcut tabloları sil
DROP TABLE IF EXISTS trends;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS kullanicilar;
DROP TABLE IF EXISTS gundem_konulari;

-- Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS kullanicilar (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tam_ad VARCHAR(255) NOT NULL,
    fakulte VARCHAR(255) NOT NULL,
    fakulte_adi VARCHAR(255) NOT NULL,
    bolum VARCHAR(255) NOT NULL,
    sartlari_kabul TINYINT(1) DEFAULT 0,
    sozlesmeyi_kabul TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Mesajlar Tablosu
CREATE TABLE mesajlar (
    id VARCHAR(255) PRIMARY KEY,
    kullanici_id VARCHAR(255) NOT NULL,
    kullanici_adi VARCHAR(255) NOT NULL,
    icerik TEXT NOT NULL,
    olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE
);

-- Mesaj Beğeniler Tablosu
CREATE TABLE mesaj_begeniler (
    mesaj_id VARCHAR(255) NOT NULL,
    kullanici_id VARCHAR(255) NOT NULL,
    olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (mesaj_id, kullanici_id),
    FOREIGN KEY (mesaj_id) REFERENCES mesajlar(id) ON DELETE CASCADE,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE
);

-- Mesaj Yorumları Tablosu
CREATE TABLE IF NOT EXISTS mesaj_yorumlar (
    id VARCHAR(255) PRIMARY KEY,
    mesaj_id VARCHAR(255) NOT NULL,
    kullanici_id VARCHAR(255) NOT NULL,
    kullanici_adi VARCHAR(255) NOT NULL,
    icerik TEXT NOT NULL,
    olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mesaj_id) REFERENCES mesajlar(id) ON DELETE CASCADE,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE
);

-- Yorum Beğenileri Tablosu
CREATE TABLE IF NOT EXISTS mesaj_yorum_begeniler (
    yorum_id VARCHAR(255) NOT NULL,
    kullanici_id VARCHAR(255) NOT NULL,
    olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (yorum_id, kullanici_id),
    FOREIGN KEY (yorum_id) REFERENCES mesaj_yorumlar(id) ON DELETE CASCADE,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE
);

-- Kitaplar Tablosu
CREATE TABLE kitaplar (
    id VARCHAR(255) PRIMARY KEY,
    baslik VARCHAR(255) NOT NULL,
    kategori VARCHAR(255) NOT NULL,
    fiyat DECIMAL(10, 2) NOT NULL,
    instagram VARCHAR(255),
    resim_url TEXT,
    satici_id VARCHAR(255) NOT NULL,
    satici_adi VARCHAR(255) NOT NULL,
    satici_fakulte VARCHAR(255),
    satici_bolum VARCHAR(255),
    olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    durum ENUM('müsait', 'satıldı', 'beklemede') NOT NULL DEFAULT 'müsait',
    FOREIGN KEY (satici_id) REFERENCES kullanicilar(id) ON DELETE CASCADE
);

-- Gündem Konuları Tablosu
CREATE TABLE gundem_konulari (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  baslik VARCHAR(255) NOT NULL,
  icerik TEXT,
  siralama INT DEFAULT 0,
  olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  guncelleme_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 
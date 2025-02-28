const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: "yamabiko.proxy.rlwy.net",
  port: 24760,
  user: "root",
  password: "XNpcNGoviOKfDNkHdBxpECMpFyMAmOnC",
  database: "railway",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 60000,        // Bağlantı zaman aşımı: 60 saniye
  idleTimeout: 60000,          // Boşta kalma zaman aşımı: 60 saniye
  maxIdle: 10,                 // Maksimum boşta bağlantı sayısı
  enableKeepAlive: true,       // Bağlantıyı canlı tut
  keepAliveInitialDelay: 0
});

// Bağlantıyı test et
const testConnection = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log("Database bağlantısı başarılı");
      connection.release();
      return true;
    } catch (err) {
      console.error(`Bağlantı denemesi ${i + 1}/${retries} başarısız:`, err);
      if (i === retries - 1) {
        console.error("Maksimum deneme sayısına ulaşıldı");
        throw err;
      }
      // 5 saniye bekle ve tekrar dene
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

// İlk bağlantıyı test et
testConnection().catch((err) => {
  console.error("Database bağlantı hatası:", err);
  process.exit(1); // Bağlantı başarısız ise uygulamayı durdur
});

// Havuz hata olaylarını dinle
pool.on("error", async (err) => {
  console.error("Havuz hatası:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.log("Bağlantı kayboldu, yeniden bağlanılıyor...");
    await testConnection();
  }
});

module.exports = {
  pool,
};

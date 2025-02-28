const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Veritabanı ve tablo oluşturma
const initDatabase = async () => {
  try {
    // Veritabanı bağlantısını test et
    await pool.query("SELECT 1");
    console.log("Veritabanı bağlantısı başarılı");

    // Schema dosyasını oku ve çalıştır
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schema);
    console.log("Veritabanı şeması başarıyla oluşturuldu");
  } catch (error) {
    console.error("Veritabanı başlatma hatası:", error);
    process.exit(1);
  }
};

// Veritabanını başlat
initDatabase();

module.exports = pool;

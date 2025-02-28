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
});

// Bağlantıyı test et
pool
  .getConnection()
  .then((connection) => {
    console.log("Database bağlantısı başarılı");
    connection.release();
  })
  .catch((err) => {
    console.error("Database bağlantı hatası:", err);
    process.exit(1); // Bağlantı başarısız ise uygulamayı durdur
  });

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'klucampus',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Database connection established successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
    });

module.exports = pool;

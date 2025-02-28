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
  connectTimeout: 60000,
  waitForConnections: true,
  connectionLimit: 15, // Increased connection limit
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true,
  debug: process.env.NODE_ENV === 'development'
});

// Add connection error handling
pool.on('connection', (connection) => {
  console.log('New database connection established');
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed. Attempting to reconnect...');
  }
});

const initDatabase = async () => {
  try {
    // Test database connection with retry mechanism
    let connected = false;
    let retries = 3;
    
    while (!connected && retries > 0) {
      try {
        await pool.query("SELECT 1");
        connected = true;
        console.log("Database connection successful");
      } catch (error) {
        retries--;
        if (retries > 0) {
          console.log(`Connection attempt failed. Retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          throw error;
        }
      }
    }

    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");
    await pool.query(schema);
    console.log("Database schema created successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1);
  }
};

initDatabase();

module.exports = pool;

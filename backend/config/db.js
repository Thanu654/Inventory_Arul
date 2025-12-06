import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config(); 

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'inventory_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log(`Attempting MySQL connection: ${config.user}@${config.host}:${config.database}`);

const pool = mysql.createPool(config);

export default pool.promise();

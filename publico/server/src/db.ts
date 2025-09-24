import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const dbSettings = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, // cámbialo a true si usas Azure o SSL
    trustServerCertificate: true,
  },
};

export async function getConnection() {
  try {
    const pool = await sql.connect(dbSettings);
    return pool;
  } catch (err) {
    console.error("Error en la conexión a la BD:", err);
    throw err;
  }
}

export { sql };

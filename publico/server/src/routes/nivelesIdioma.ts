// routes/nivelesIdioma.ts
import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM nivelesIdioma");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener niveles de idioma" });
  }
});

export default router;

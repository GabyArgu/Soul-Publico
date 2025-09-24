import { Router } from "express";
import { getConnection, sql } from "../db";

const router = Router();

// GET todas las carreras
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query("SELECT idCarrera, nombre FROM carreras ORDER BY nombre ASC");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener las carreras" });
  }
});

export default router;

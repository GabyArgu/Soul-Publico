import { Router } from "express";
import { getConnection, sql } from "../db";

const router = Router();

// GET todos los departamentos
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query("SELECT idDepartamento, nombre FROM departamentos ORDER BY nombre ASC");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los departamentos" });
  }
});

export default router;

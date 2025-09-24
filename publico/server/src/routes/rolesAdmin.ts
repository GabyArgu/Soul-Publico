import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM rolesAdmin");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener roles" });
  }
});

export default router;

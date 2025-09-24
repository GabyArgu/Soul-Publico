import { Router } from "express";
import { getConnection, sql } from "../db";

const router = Router();

// GET todos los administradores
router.get("/", async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM administradores");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener administradores" });
    }
});

export default router;

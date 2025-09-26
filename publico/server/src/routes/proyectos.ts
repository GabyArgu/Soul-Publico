// routes/proyectos.ts
import { Router } from "express";
import { getConnection } from "../db";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
        SELECT 
        idProyecto,
        nombreProyecto as titulo,
        descripcion,
        capacidad,
        horasServicio as horas,
        tipoProyecto
        FROM vProyectosResumen
        ORDER BY tipoProyecto, nombreProyecto
    `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener proyectos" });
    }
});

export default router;
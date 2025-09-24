import { Router } from "express";
import { getConnection, sql } from "../db";

const router = Router();

// GET todas las aplicaciones
router.get("/", async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM aplicaciones");
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener aplicaciones" });
    }
});

// POST crear aplicación
router.post("/", async (req, res) => {
    try {
        const { idUsuario, idProyecto, idEstado, urlCartaAceptacion } = req.body;
        const pool = await getConnection();
        await pool.request()
            .input("idUsuario", sql.Int, idUsuario)
            .input("idProyecto", sql.Int, idProyecto)
            .input("idEstado", sql.TinyInt, idEstado)
            .input("urlCartaAceptacion", sql.NVarChar, urlCartaAceptacion)
            .query("INSERT INTO aplicaciones (idUsuario,idProyecto,idEstado,urlCartaAceptacion) VALUES (@idUsuario,@idProyecto,@idEstado,@urlCartaAceptacion)");
        res.json({ message: "Aplicación creada" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear aplicación" });
    }
});

export default router;

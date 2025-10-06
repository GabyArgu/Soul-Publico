import { Router } from "express";
import { getConnection, sql } from "../db";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM habilidades");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener habilidades" });
  }
});

// NUEVO ENDPOINT PARA CREAR HABILIDADES
router.post("/", async (req, res) => {
  const { nombre, tipo } = req.body;

  try {
    const pool = await getConnection();
    
    // Verificar si ya existe una habilidad con el mismo nombre y tipo
    const existeResult = await pool.request()
      .input('nombre', sql.NVarChar(100), nombre)
      .input('tipo', sql.NVarChar(20), tipo)
      .query('SELECT idHabilidad FROM habilidades WHERE nombre = @nombre AND tipo = @tipo');

    if (existeResult.recordset.length > 0) {
      return res.json(existeResult.recordset[0]); // Retornar la existente
    }

    // Insertar nueva habilidad
    const result = await pool.request()
      .input('nombre', sql.NVarChar(100), nombre)
      .input('tipo', sql.NVarChar(20), tipo)
      .query('INSERT INTO habilidades (nombre, tipo) OUTPUT INSERTED.idHabilidad, INSERTED.nombre, INSERTED.tipo VALUES (@nombre, @tipo)');

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Error creando habilidad:", err);
    res.status(500).json({ error: "Error al crear habilidad" });
  }
});

export default router;
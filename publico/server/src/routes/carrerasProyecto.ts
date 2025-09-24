import { Router } from "express";
import { getConnection, sql } from "../db";

const router = Router();

// GET relaciones
router.get("/", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM carrerasProyecto");
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener relaciones" });
  }
});

// POST nueva relación
router.post("/", async (req, res) => {
  try {
    const { idProyecto, idCarrera } = req.body;
    const pool = await getConnection();
    await pool.request()
      .input("idProyecto", sql.Int, idProyecto)
      .input("idCarrera", sql.Int, idCarrera)
      .query("INSERT INTO carrerasProyecto (idProyecto,idCarrera) VALUES (@idProyecto,@idCarrera)");
    res.json({ message: "Relación creada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear relación" });
  }
});

// DELETE relación
router.delete("/", async (req, res) => {
  try {
    const { idProyecto, idCarrera } = req.body;
    const pool = await getConnection();
    await pool.request()
      .input("idProyecto", sql.Int, idProyecto)
      .input("idCarrera", sql.Int, idCarrera)
      .query("DELETE FROM carrerasProyecto WHERE idProyecto=@idProyecto AND idCarrera=@idCarrera");
    res.json({ message: "Relación eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar relación" });
  }
});

export default router;

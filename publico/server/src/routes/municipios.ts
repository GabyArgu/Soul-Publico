import { Router } from "express";
import { getConnection, sql } from "../db";

const router = Router();

// GET municipios por departamento
router.get("/:idDepartamento", async (req, res) => {
  const { idDepartamento } = req.params;

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("idDepartamento", sql.Int, idDepartamento)
      .query("SELECT idMunicipio, nombre FROM municipios WHERE idDepartamento = @idDepartamento ORDER BY nombre ASC");
    
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los municipios" });
  }
});

export default router;

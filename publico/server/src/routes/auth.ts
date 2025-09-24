import { Router } from "express";
import { getConnection, sql } from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

// Login con debug total
router.post("/login", async (req, res) => {
  const { carnet, password } = req.body;

  console.log("=== LOGIN REQUEST ===");
  console.log("Carnet recibido:", carnet);
  console.log("Password recibido:", password);

  try {
    const pool = await getConnection();

    const result = await pool
      .request()
      .input("carnet", sql.NVarChar, carnet)
      .query("SELECT * FROM usuarios WHERE carnet = @carnet AND estado = 1");

    if (result.recordset.length === 0) {
      console.log("Usuario no encontrado o inactivo");
      return res.status(400).json({ error: "Usuario no encontrado o inactivo" });
    }

    const user = result.recordset[0];
    console.log("Usuario encontrado:", user.carnet, user.nombreCompleto);

    // Convertir VARBINARY correctamente a string UTF-8
    const storedHash = Buffer.from(user.passwordHash).toString("utf8");
    console.log("Stored hash (utf8):", storedHash);

    const isMatch = await bcrypt.compare(password, storedHash);
    console.log("Contraseña coincide:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, carnet: user.carnet },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        nombreCompleto: user.nombreCompleto,
        carnet: user.carnet,
      },
    });

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en login" });
  }
});

export default router;

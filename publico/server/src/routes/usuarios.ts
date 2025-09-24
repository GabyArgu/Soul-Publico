import { Router } from "express";
import { getConnection, sql } from "../db";
import bcrypt from "bcryptjs";

const router = Router();

// GET usuario por id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM usuarios WHERE idUsuario=@id");
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// POST crear usuario
router.post("/", async (req, res) => {
  try {
    const {
      nombreCompleto,
      carnet,
      fechaNacimiento,
      email,
      telefono,
      idDepartamento,
      idMunicipio,
      idCarrera,
      uvs = 0,
      idDisponibilidad,
      tieneTransporte = 0,
      urlCv,
      password
    } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const pool = await getConnection();
    await pool.request()
      .input("nombreCompleto", sql.NVarChar(150), nombreCompleto)
      .input("carnet", sql.NVarChar(30), carnet)
      .input("fechaNacimiento", sql.Date, fechaNacimiento)
      .input("email", sql.NVarChar(150), email)
      .input("telefono", sql.NVarChar(30), telefono)
      .input("idDepartamento", sql.Int, idDepartamento)
      .input("idMunicipio", sql.Int, idMunicipio)
      .input("idCarrera", sql.Int, idCarrera)
      .input("uvs", sql.SmallInt, uvs)
      .input("idDisponibilidad", sql.TinyInt, idDisponibilidad)
      .input("tieneTransporte", sql.Bit, tieneTransporte)
      .input("urlCv", sql.NVarChar(500), urlCv)
      .input("passwordHash", sql.VarBinary(256), Buffer.from(passwordHash, "utf8"))
      .query(`INSERT INTO usuarios 
        (nombreCompleto,carnet,fechaNacimiento,email,telefono,idDepartamento,idMunicipio,idCarrera,uvs,idDisponibilidad,tieneTransporte,urlCv,passwordHash) 
        VALUES 
        (@nombreCompleto,@carnet,@fechaNacimiento,@email,@telefono,@idDepartamento,@idMunicipio,@idCarrera,@uvs,@idDisponibilidad,@tieneTransporte,@urlCv,@passwordHash)`);

    res.json({ message: "Usuario creado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// PUT editar usuario
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombreCompleto,
      fechaNacimiento,
      email,
      telefono,
      idDepartamento,
      idMunicipio,
      idCarrera,
      uvs,
      idDisponibilidad,
      tieneTransporte,
      urlCv
    } = req.body;

    const pool = await getConnection();
    await pool.request()
      .input("id", sql.Int, id)
      .input("nombreCompleto", sql.NVarChar(150), nombreCompleto)
      .input("fechaNacimiento", sql.Date, fechaNacimiento)
      .input("email", sql.NVarChar(150), email)
      .input("telefono", sql.NVarChar(30), telefono)
      .input("idDepartamento", sql.Int, idDepartamento)
      .input("idMunicipio", sql.Int, idMunicipio)
      .input("idCarrera", sql.Int, idCarrera)
      .input("uvs", sql.SmallInt, uvs)
      .input("idDisponibilidad", sql.TinyInt, idDisponibilidad)
      .input("tieneTransporte", sql.Bit, tieneTransporte)
      .input("urlCv", sql.NVarChar(500), urlCv)
      .query(`UPDATE usuarios SET 
        nombreCompleto=@nombreCompleto,
        fechaNacimiento=@fechaNacimiento,
        email=@email,
        telefono=@telefono,
        idDepartamento=@idDepartamento,
        idMunicipio=@idMunicipio,
        idCarrera=@idCarrera,
        uvs=@uvs,
        idDisponibilidad=@idDisponibilidad,
        tieneTransporte=@tieneTransporte,
        urlCv=@urlCv,
        fechaActualizado=SYSUTCDATETIME()
        WHERE idUsuario=@id`);

    res.json({ message: "Usuario actualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

export default router;

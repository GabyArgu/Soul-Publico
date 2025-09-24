import { Router } from "express";
import { getConnection, sql } from "../db";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/crear", async (req, res) => {
  // Usa los nombres que vienen de React Native
  const {
    nombre,                    // ✅ Viene de React Native
    carnet,                    // ✅ Viene de React Native  
    fechaNacimiento,           // ✅ Viene de React Native
    email,                     // ✅ Viene de React Native
    telefono,                  // ✅ Viene de React Native
    departamento,              // ✅ Viene de React Native
    municipio,                 // ✅ Viene de React Native
    idCarrera,                 // ✅ Viene de React Native (se llama idCarrera)
    uvs,                       // ✅ Viene de React Native
    idIdioma,                  // ✅ Viene de React Native (se llama idIdioma)
    idNivel,                   // ✅ Viene de React Native (se llama idNivel)
    idHorario,                 // ✅ Viene de React Native (se llama idHorario)
    habilidadesTecnicas, 
    habilidadesBlandas,
    transportarse, 
    urlCv, 
    password
  } = req.body;

  console.log("🔍 Todos los campos recibidos:", req.body);

  let transaction: sql.Transaction | undefined;

  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // 1️⃣ Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // 2️⃣ Inserción en tabla 'usuarios' - USANDO LOS NOMBRES CORRECTOS
    const resultUsuario = await transaction.request()
      .input('nombreCompleto', sql.NVarChar(150), nombre)        // ✅ nombre → nombreCompleto
      .input('carnet', sql.NVarChar(30), carnet)
      .input('fechaNacimiento', sql.Date, fechaNacimiento)
      .input('email', sql.NVarChar(150), email)
      .input('telefono', sql.NVarChar(30), telefono)
      .input('idDepartamento', sql.Int, Number(departamento))
      .input('idMunicipio', sql.Int, Number(municipio))
      .input('idCarrera', sql.Int, Number(idCarrera))            // ✅ idCarrera → idCarrera
      .input('uvs', sql.SmallInt, Number(uvs))
      .input('idDisponibilidad', sql.TinyInt, Number(idHorario)) // ✅ idHorario → idDisponibilidad
      .input('tieneTransporte', sql.Bit, transportarse)
      .input('urlCv', sql.NVarChar(500), urlCv)
      .input('passwordHash', sql.VarBinary(256), Buffer.from(passwordHash))
      .query(`
        INSERT INTO usuarios (nombreCompleto, carnet, fechaNacimiento, email, telefono, idDepartamento, idMunicipio, idCarrera, uvs, idDisponibilidad, tieneTransporte, urlCv, passwordHash)
        OUTPUT INSERTED.idUsuario
        VALUES (@nombreCompleto, @carnet, @fechaNacimiento, @email, @telefono, @idDepartamento, @idMunicipio, @idCarrera, @uvs, @idDisponibilidad, @tieneTransporte, @urlCv, @passwordHash);
      `);

    const idUsuario = resultUsuario.recordset[0].idUsuario;

    // 3️⃣ Insertar habilidades
    const insertarHabilidades = async (habilidadesStr: string) => {
      if (!habilidadesStr) return;
      
      const ids = habilidadesStr.split(',').map(id => id.trim()).filter(id => id !== '').map(Number);
      
      console.log(`📝 Insertando habilidades: ${ids.join(', ')}`);
      
      for (const idHabilidad of ids) {
        if (!isNaN(idHabilidad)) {
          await transaction!.request()
            .input('idUsuario', sql.Int, idUsuario)
            .input('idHabilidad', sql.Int, idHabilidad)
            .query(`INSERT INTO habilidadesUsuario (idUsuario, idHabilidad) VALUES (@idUsuario, @idHabilidad);`);
        }
      }
    };

    await insertarHabilidades(habilidadesTecnicas);
    await insertarHabilidades(habilidadesBlandas);

    // 4️⃣ Inserción en 'idiomasUsuario'
    if (idIdioma && idNivel) {  // ✅ idIdioma y idNivel
      await transaction.request()
        .input('idUsuario', sql.Int, idUsuario)
        .input('idIdioma', sql.Int, Number(idIdioma))
        .input('idINivel', sql.Int, Number(idNivel))
        .query(`INSERT INTO idiomasUsuario (idUsuario, idIdioma, idINivel) VALUES (@idUsuario, @idIdioma, @idINivel);`);
    }

    // 5️⃣ Commit
    await transaction.commit();
    res.status(201).json({ mensaje: "Usuario creado con éxito", idUsuario });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("❌ Error al crear usuario:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: "Error interno del servidor", detalle: errorMessage });
  }
});
export default router;

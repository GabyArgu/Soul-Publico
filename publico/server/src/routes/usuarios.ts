import { Router } from "express";
import { getConnection, sql } from "../db";
import bcrypt from "bcryptjs";

const router = Router();

router.post("/crear", async (req, res) => {
  const {
    nombre,                    
    carnet,                    
    genero, 
    fechaNacimiento,           
    email,                     
    telefono,                  
    departamento,              
    municipio,                 
    idCarrera,                 
    uvs,                       
    idIdioma,                  
    idNivel,                   
    idHorario,                 
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

    const passwordHash = await bcrypt.hash(password, 10);

    const resultUsuario = await transaction.request()
      .input('nombreCompleto', sql.NVarChar(150), nombre)
      .input('carnet', sql.NVarChar(30), carnet)
      .input('genero', sql.Char(1), genero) 
      .input('fechaNacimiento', sql.Date, fechaNacimiento)
      .input('email', sql.NVarChar(150), email)
      .input('telefono', sql.NVarChar(30), telefono)
      .input('idDepartamento', sql.Int, Number(departamento))
      .input('idMunicipio', sql.Int, Number(municipio))
      .input('idCarrera', sql.Int, Number(idCarrera))
      .input('uvs', sql.SmallInt, Number(uvs))
      .input('idDisponibilidad', sql.TinyInt, Number(idHorario))
      .input('tieneTransporte', sql.Bit, transportarse)
      .input('urlCv', sql.NVarChar(500), urlCv)
      .input('passwordHash', sql.VarBinary(256), Buffer.from(passwordHash))
      .query(`
        INSERT INTO usuarios (nombreCompleto, carnet, genero, fechaNacimiento, email, telefono, idDepartamento, idMunicipio, idCarrera, uvs, idDisponibilidad, tieneTransporte, urlCv, passwordHash)
        OUTPUT INSERTED.idUsuario
        VALUES (@nombreCompleto, @carnet, @genero, @fechaNacimiento, @email, @telefono, @idDepartamento, @idMunicipio, @idCarrera, @uvs, @idDisponibilidad, @tieneTransporte, @urlCv, @passwordHash);
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

    if (idIdioma && idNivel) {
      await transaction.request()
        .input('idUsuario', sql.Int, idUsuario)
        .input('idIdioma', sql.Int, Number(idIdioma))
        .input('idINivel', sql.Int, Number(idNivel))
        .query(`INSERT INTO idiomasUsuario (idUsuario, idIdioma, idINivel) VALUES (@idUsuario, @idIdioma, @idINivel);`);
    }

    await transaction.commit();
    res.status(201).json({ mensaje: "Usuario creado con éxito", idUsuario });

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("❌ Error al crear usuario:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    res.status(500).json({ error: "Error interno del servidor", detalle: errorMessage });
  }
});


// GET /api/usuarios/:carnet
router.get("/:carnet", async (req, res) => {
    const { carnet } = req.params;

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('carnet', sql.NVarChar(30), carnet)
            .query(`
                SELECT 
                    u.nombreCompleto,
                    u.carnet,
                    u.email,
                    u.fechaNacimiento,
                    u.telefono,
                    u.uvs,
                    u.urlCv,
                    u.genero,
                    d.nombre as departamento,
                    m.nombre as municipio,
                    c.nombre as carrera,
                    od.nombre as disponibilidad
                FROM usuarios u
                LEFT JOIN departamentos d ON u.idDepartamento = d.idDepartamento
                LEFT JOIN municipios m ON u.idMunicipio = m.idMunicipio
                LEFT JOIN carreras c ON u.idCarrera = c.idCarrera
                LEFT JOIN opcionesDisponibilidad od ON u.idDisponibilidad = od.idDisponibilidad
                WHERE u.carnet = @carnet AND u.estado = 1
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error("Error obteniendo usuario:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;
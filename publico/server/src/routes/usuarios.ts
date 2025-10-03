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
                    u.idUsuario,
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

router.get("/:carnet/habilidades", async (req, res) => {
  const { carnet } = req.params;

  try {
    const pool = await getConnection();
    
    const result = await pool.request()
      .input("carnet", sql.VarChar, carnet)
      .query(`
        SELECT 
          h.idHabilidad,
          h.nombre,
          h.tipo
        FROM habilidadesUsuario hu
        INNER JOIN habilidades h ON hu.idHabilidad = h.idHabilidad
        INNER JOIN usuarios u ON hu.idUsuario = u.idUsuario
        WHERE u.carnet = @carnet
      `);
    
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener las habilidades del usuario" });
  }
});

router.get("/:carnet/idiomas", async (req, res) => {
  const { carnet } = req.params;

  try {
    const pool = await getConnection();
    console.log("✅ Conexión a BD establecida");

    // Primero verifiquemos si el usuario existe
    const usuarioResult = await pool.request()
      .input("carnet", sql.VarChar, carnet)
      .query("SELECT idUsuario FROM usuarios WHERE carnet = @carnet");
    
    if (usuarioResult.recordset.length === 0) {
      console.log("❌ Usuario no encontrado");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const idUsuario = usuarioResult.recordset[0].idUsuario;
    console.log(`✅ Usuario encontrado, ID: ${idUsuario}`);

    const result = await pool.request()
      .input("idUsuario", sql.Int, idUsuario)
      .query(`
        SELECT 
          iu.idIdioma,
          iu.idINivel,
          i.nombre as nombreIdioma,
          n.nombre as nombreNivel
        FROM idiomasUsuario iu
        INNER JOIN idiomas i ON iu.idIdioma = i.idIdioma
        INNER JOIN nivelesIdioma n ON iu.idINivel = n.idINivel
        WHERE iu.idUsuario = @idUsuario
      `);
    
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error en endpoint de idiomas:", err);
    res.status(500).json({ 
      error: "Error al obtener los idiomas del usuario",
      details: err
    });
  }
});

router.put("/:carnet", async (req, res) => {
    const { carnet } = req.params;
    const {
        nombre, 
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
        idHorario, // Mapea a idDisponibilidad en la DB
        habilidadesTecnicas, 
        habilidadesBlandas,
        transportarse, 
        urlCv
    } = req.body;

    console.log("🔍 Actualizando usuario:", carnet, req.body);

    // Inicializamos la transacción como opcional.
    // Esto genera la advertencia TS18048 si no se chequea en el catch.
    let transaction: sql.Transaction | undefined;

    try {
        // 1. Conexión y comienzo de la transacción
        const pool = await getConnection();
        transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 2. Obtener el ID del usuario para operaciones secundarias (habilidades/idiomas)
        const usuarioActual = await transaction.request()
            .input('carnet', sql.NVarChar(30), carnet)
            .query('SELECT idUsuario FROM usuarios WHERE carnet = @carnet AND estado = 1');
        
        // Si no se encuentra el usuario, hacer rollback y responder 404
        if (usuarioActual.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const idUsuario = usuarioActual.recordset[0].idUsuario;

        // 3. Construir query dinámico para actualizar la tabla 'usuarios'
        let updateQuery = `
            UPDATE usuarios 
            SET fechaActualizado = GETDATE()
        `;
        
        const request = transaction.request();
        request.input('carnet', sql.NVarChar(30), carnet);

        // Se verifica si el campo existe en req.body (no es 'undefined') antes de agregarlo al query
        if (nombre !== undefined) {
            updateQuery += `, nombreCompleto = @nombreCompleto`;
            request.input('nombreCompleto', sql.NVarChar(150), nombre);
        }

        if (genero !== undefined) {
            updateQuery += `, genero = @genero`;
            request.input('genero', sql.Char(1), genero);
        }

        if (fechaNacimiento !== undefined) {
            updateQuery += `, fechaNacimiento = @fechaNacimiento`;
            request.input('fechaNacimiento', sql.Date, fechaNacimiento);
        }

        if (email !== undefined) {
            updateQuery += `, email = @email`;
            request.input('email', sql.NVarChar(150), email);
        }

        if (telefono !== undefined) {
            updateQuery += `, telefono = @telefono`;
            request.input('telefono', sql.NVarChar(30), telefono);
        }

        if (departamento !== undefined) {
            updateQuery += `, idDepartamento = @idDepartamento`;
            request.input('idDepartamento', sql.Int, Number(departamento));
        }

        if (municipio !== undefined) {
            updateQuery += `, idMunicipio = @idMunicipio`;
            request.input('idMunicipio', sql.Int, Number(municipio));
        }

        if (idCarrera !== undefined) {
            updateQuery += `, idCarrera = @idCarrera`;
            request.input('idCarrera', sql.Int, Number(idCarrera));
        }

        if (uvs !== undefined) {
            updateQuery += `, uvs = @uvs`;
            request.input('uvs', sql.SmallInt, Number(uvs));
        }

        if (idHorario !== undefined) {
            // idHorario del frontend mapea a idDisponibilidad en la DB
            updateQuery += `, idDisponibilidad = @idDisponibilidad`;
            request.input('idDisponibilidad', sql.TinyInt, Number(idHorario));
        }

        if (transportarse !== undefined) {
            updateQuery += `, tieneTransporte = @tieneTransporte`;
            request.input('tieneTransporte', sql.Bit, transportarse);
        }

        if (urlCv !== undefined) {
            updateQuery += `, urlCv = @urlCv`;
            request.input('urlCv', sql.NVarChar(500), urlCv);
        }

        // Finalizar el query de la tabla 'usuarios'
        updateQuery += ` WHERE carnet = @carnet AND estado = 1;`;

        // Ejecutar actualización solo si se actualizó algo más que 'fechaActualizado' (la coma inicial)
        if (updateQuery.includes(',')) {
            await request.query(updateQuery);
            console.log("✅ Datos básicos de usuario actualizados");
        }

        // 4. Función para manejar habilidades (técnicas y blandas)
        const insertarHabilidades = async (habilidadesStr: string) => {
            // Validación para evitar procesar cadenas vacías o solo espacios
            if (!habilidadesStr || habilidadesStr.trim() === '') return;
            
            // Convertir la cadena de IDs separada por comas a un array de números
            const ids = habilidadesStr
                .split(',')
                .map(id => id.trim())
                .filter(id => id !== '' && id !== 'null')
                .map(Number);
            
            console.log(`📝 Habilidades a insertar: ${ids.join(', ')}`);
            
            // Insertar cada habilidad individualmente dentro de la transacción
            for (const idHabilidad of ids) {
                if (!isNaN(idHabilidad) && idHabilidad > 0) {
                    await transaction!.request() // Usamos 'transaction!' porque sabemos que está definido aquí
                        .input('idUsuario', sql.Int, idUsuario)
                        .input('idHabilidad', sql.Int, idHabilidad)
                        .query(`INSERT INTO habilidadesUsuario (idUsuario, idHabilidad) VALUES (@idUsuario, @idHabilidad);`);
                }
            }
        };

        // Si se envió al menos un campo de habilidad, manejar la actualización de la tabla 'habilidadesUsuario'
        if (habilidadesTecnicas !== undefined || habilidadesBlandas !== undefined) {
            // Eliminar todas las habilidades existentes del usuario antes de re-insertar
            await transaction.request()
                .input('idUsuario', sql.Int, idUsuario)
                .query('DELETE FROM habilidadesUsuario WHERE idUsuario = @idUsuario');

            // Insertar nuevas listas de habilidades
            if (habilidadesTecnicas !== undefined) await insertarHabilidades(habilidadesTecnicas);
            if (habilidadesBlandas !== undefined) await insertarHabilidades(habilidadesBlandas);
            console.log("✅ Habilidades actualizadas");
        }

        // 5. Manejar idiomas
        // Solo actualizar si ambos, idIdioma y idNivel, están presentes
        if (idIdioma !== undefined && idNivel !== undefined) {
            // Eliminar el idioma existente (asumiendo que solo se maneja un idioma secundario)
            await transaction.request()
                .input('idUsuario', sql.Int, idUsuario)
                .query('DELETE FROM idiomasUsuario WHERE idUsuario = @idUsuario');

            // Solo insertar si los valores recibidos son válidos (no vacíos o 'null')
            if (idIdioma && idNivel && idIdioma !== 'null' && idNivel !== 'null') {
                await transaction.request()
                    .input('idUsuario', sql.Int, idUsuario)
                    .input('idIdioma', sql.Int, Number(idIdioma))
                    .input('idINivel', sql.Int, Number(idNivel))
                    .query(`INSERT INTO idiomasUsuario (idUsuario, idIdioma, idINivel) VALUES (@idUsuario, @idIdioma, @idINivel);`);
                console.log("✅ Idioma actualizado");
            } else {
                console.log("⚠️ Idioma/Nivel no enviado o inválido, solo se eliminaron los anteriores.");
            }
        }

        // 6. Commit de la transacción
        await transaction.commit();
        res.status(200).json({ 
            mensaje: "Usuario actualizado con éxito", 
            carnet,
            camposActualizados: "Ver logs para detalles"
        });

    } catch (error) {
        // Solución al error TS18048: La comprobación 'if (transaction)' asegura que
        // solo se intente el rollback si la transacción fue inicializada con éxito.
        if (transaction) await transaction.rollback(); 
        
        console.error("❌ Error al actualizar usuario:", error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ 
            error: "Error interno del servidor", 
            detalle: errorMessage,
            stack: error
        });
    }
});

export default router;
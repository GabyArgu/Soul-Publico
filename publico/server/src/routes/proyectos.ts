import { Router } from "express";
import { getConnection } from "../db";
import { RecommendationService } from "../routes/recommendationService";

const recommendationService = new RecommendationService();

const router = Router();

// GET /proyectos/idiomas
router.get("/idiomas", async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT DISTINCT idi.nombre 
            FROM idiomasProyecto ip
            INNER JOIN idiomas idi ON ip.idIdioma = idi.idIdioma
        `);
        res.json(result.recordset.map(r => r.nombre));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener idiomas" });
    }
});

// GET /proyectos/carreras
router.get("/carreras", async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT DISTINCT c.nombre 
            FROM carreras c
            INNER JOIN carrerasProyecto cp ON c.idCarrera = cp.idCarrera
        `);
        res.json(result.recordset.map(r => r.nombre));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener carreras" });
    }
});

// GET /proyectos/modalidades
router.get("/modalidades", async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM modalidades");
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener modalidades" });
    }
});

// GET /proyectos/instituciones
router.get("/instituciones", async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT 
                i.idInstitucion,
                i.nombre,
                i.idDepartamento,
                i.idMunicipio,
                d.nombre as departamento,
                m.nombre as municipio,
                i.nombreContacto,
                i.telefonoContacto,
                i.emailContacto
            FROM instituciones i
            INNER JOIN departamentos d ON i.idDepartamento = d.idDepartamento
            INNER JOIN municipios m ON i.idMunicipio = m.idMunicipio
            WHERE i.estado = 1
        `);
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener instituciones" });
    }
});

// GET /proyectos (Lista de proyectos con filtros)
router.get("/", async (req, res) => {
    try {
        const { search, modalidad, carrera, idioma, minHoras, maxHoras } = req.query;
        const pool = await getConnection();

        let query = `
            SELECT 
                idProyecto,
                nombreProyecto as titulo,
                descripcion,
                capacidad,
                fechaAplicacion,
                modalidad,
                horasServicio as horas,
                tipoProyecto,
                carrerasRelacionadas,
                habilidadesRelacionadas,
                idiomasRelacionados
            FROM vProyectosResumen
            WHERE 1=1
        `;

        if (search) {
            query += ` AND (nombreProyecto LIKE '%' + @search + '%' OR descripcion LIKE '%' + @search + '%')`;
        }
        if (modalidad) {
            query += ` AND modalidad LIKE '%' + @modalidad + '%'`;
        }
        if (carrera) {
            query += ` AND carrerasRelacionadas LIKE '%' + @carrera + '%'`;
        }
        if (idioma) {
            query += ` AND idiomasRelacionados LIKE '%' + @idioma + '%'`;
        }
        if (minHoras) {
            query += ` AND horasServicio >= @minHoras`;
        }
        if (maxHoras) {
            query += ` AND horasServicio <= @maxHoras`;
        }

        query += " ORDER BY tipoProyecto, nombreProyecto";

        const result = await pool.request()
            .input("search", search || "")
            .input("modalidad", modalidad || "")
            .input("carrera", carrera || "")
            .input("idioma", idioma || "")
            .input("minHoras", minHoras || 0) 
            .input("maxHoras", maxHoras || null) 
            .query(query);

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener proyectos" });
    }
});

// GET /proyectos/:id (Detalle de proyecto) 
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();

        const query = `
            SELECT 
                idProyecto,
                nombreProyecto as titulo,
                descripcion,
                capacidad,
                horasServicio as horas,
                tipoProyecto,
                fechaInicio,
                fechaFin,
                fechaAplicacion,
                nombreInstitucion as institucion,
                telefonoContacto as telefono,
                emailContacto,
                nombreContacto,
                carrerasRelacionadas,
                habilidadesRelacionadas,
                idiomasRelacionados,
                modalidad
            FROM vProyectosResumen
            WHERE idProyecto = @idProyecto
        `;

        const result = await pool.request()
            .input("idProyecto", id) 
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Proyecto no encontrado" });
        }

        const proyecto = result.recordset[0];
        res.json(proyecto);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener detalles del proyecto" });
    }
});

// POST /proyectos (Crear nuevo proyecto)
router.post("/", async (req, res) => {
    const transaction = await getConnection().then(pool => pool.transaction());

    try {
        const {
            titulo,
            descripcion,
            capacidad,
            horas,
            carrerasRelacionadas,
            habilidadesRelacionadas,
            idiomasRelacionados,
            idInstitucion, 
            nombreInstitucion, 
            idDepartamento,
            idMunicipio,
            nombreContacto,
            telefonoContacto,
            emailContacto,
            fechaInicio,
            fechaFin,
            fechaAplicacion,
            idModalidad,
            carnetUsuario 
        } = req.body;

        await transaction.begin();

        let institucionId = idInstitucion;

        // PASO 1: Crear institución si no existe
        if (!institucionId && nombreInstitucion) {
            const institucionResult = await transaction.request()
                .input("nombre", nombreInstitucion)
                .input("idDepartamento", idDepartamento)
                .input("idMunicipio", idMunicipio)
                .input("nombreContacto", nombreContacto)
                .input("telefonoContacto", telefonoContacto)
                .input("emailContacto", emailContacto)
                .query(`
                    INSERT INTO instituciones (nombre, idDepartamento, idMunicipio, nombreContacto, telefonoContacto, emailContacto, estado)
                    OUTPUT INSERTED.idInstitucion
                    VALUES (@nombre, @idDepartamento, @idMunicipio, @nombreContacto, @telefonoContacto, @emailContacto, 1)
                `);

            institucionId = institucionResult.recordset[0].idInstitucion;
        }

        // PASO 2: Obtener ID del usuario por carnet
        const usuarioResult = await transaction.request()
            .input("carnet", carnetUsuario)
            .query("SELECT idUsuario FROM usuarios WHERE carnet = @carnet");

        if (usuarioResult.recordset.length === 0) {
            throw new Error("Usuario no encontrado");
        }

        const idUsuario = usuarioResult.recordset[0].idUsuario;

        // PASO 3: Crear el proyecto
        const proyectoResult = await transaction.request()
            .input("titulo", titulo)
            .input("descripcion", descripcion)
            .input("capacidad", capacidad)
            .input("horasServicio", horas)
            .input("idInstitucion", institucionId)
            .input("fechaInicio", fechaInicio)
            .input("fechaFin", fechaFin)
            .input("fechaAplicacion", fechaAplicacion)
            .input("idModalidad", idModalidad)
            .input("idUsuario", idUsuario)
            .query(`
                INSERT INTO proyectos (
                    nombre, descripcion, capacidad, horasServicio,
                    idInstitucion, fechaInicio, fechaFin, fechaAplicacion, idModalidad, 
                    idUsuario, estado
                ) 
                OUTPUT INSERTED.idProyecto
                VALUES (
                    @titulo, @descripcion, @capacidad, @horasServicio,
                    @idInstitucion, @fechaInicio, @fechaFin, @fechaAplicacion, @idModalidad,
                    @idUsuario, 1
                )
            `);

        const idProyecto = proyectoResult.recordset[0].idProyecto;

        // PASO 4: Insertar carreras relacionadas
        if (carrerasRelacionadas && Array.isArray(carrerasRelacionadas)) {
            for (const idCarrera of carrerasRelacionadas) {
                await transaction.request()
                    .input("idProyecto", idProyecto)
                    .input("idCarrera", idCarrera)
                    .query(`
                        INSERT INTO carrerasProyecto (idProyecto, idCarrera)
                        VALUES (@idProyecto, @idCarrera)
                    `);
            }
        }

        // PASO 5: Insertar habilidades relacionadas
        if (habilidadesRelacionadas && Array.isArray(habilidadesRelacionadas)) {
            for (const habilidad of habilidadesRelacionadas) {
                await transaction.request()
                    .input("idProyecto", idProyecto)
                    .input("idHabilidad", habilidad.idHabilidad)
                    .input("esRequerida", habilidad.esRequerida)
                    .query(`
                        INSERT INTO habilidadesProyecto (idProyecto, idHabilidad, esRequerida)
                        VALUES (@idProyecto, @idHabilidad, @esRequerida)
                    `);
            }
        }

        // PASO 6: Insertar idiomas relacionados
        if (idiomasRelacionados && Array.isArray(idiomasRelacionados)) {
            for (const idioma of idiomasRelacionados) {
                await transaction.request()
                    .input("idProyecto", idProyecto)
                    .input("idIdioma", idioma.idIdioma)
                    .input("idINivel", idioma.idINivel)
                    .query(`
                        INSERT INTO idiomasProyecto (idProyecto, idIdioma, idINivel)
                        VALUES (@idProyecto, @idIdioma, @idINivel)
                    `);
            }
        }

        await transaction.commit();

        res.status(201).json({
            idProyecto: idProyecto,
            message: "Proyecto creado exitosamente"
        });

    } catch (error) {
        await transaction.rollback();
        console.error("Error detallado:", error);
        res.status(500).json({ error: "Error al crear proyecto: " + error });
    }
});

router.get("/recomendados/:carnet", async (req, res) => {
  try {
    const { carnet } = req.params;
    const { search, modalidad, carrera, idioma, minHoras, maxHoras } = req.query;
    
    // Primero obtener todos los proyectos (con los filtros existentes)
    const pool = await getConnection();
    
    let query = `
      SELECT 
        idProyecto,
        nombreProyecto as titulo,
        descripcion,
        capacidad,
        fechaAplicacion,
        modalidad,
        horasServicio as horas,
        tipoProyecto,
        carrerasRelacionadas,
        habilidadesRelacionadas,
        idiomasRelacionados
      FROM vProyectosResumen
      WHERE 1=1
    `;

    if (search) {
      query += ` AND (nombreProyecto LIKE '%' + @search + '%' OR descripcion LIKE '%' + @search + '%')`;
    }
    if (modalidad) {
      query += ` AND modalidad LIKE '%' + @modalidad + '%'`;
    }
    if (carrera) {
      query += ` AND carrerasRelacionadas LIKE '%' + @carrera + '%'`;
    }
    if (idioma) {
      query += ` AND idiomasRelacionados LIKE '%' + @idioma + '%'`;
    }
    if (minHoras) {
      query += ` AND horasServicio >= @minHoras`;
    }
    if (maxHoras) {
      query += ` AND horasServicio <= @maxHoras`;
    }

    query += " ORDER BY tipoProyecto, nombreProyecto";

    const result = await pool.request()
      .input("search", search || "")
      .input("modalidad", modalidad || "")
      .input("carrera", carrera || "")
      .input("idioma", idioma || "")
      .input("minHoras", minHoras || 0)
      .input("maxHoras", maxHoras || null)
      .query(query);

    const allProjects = result.recordset;

    // Aplicar sistema de recomendación
    const recommendedProjects = await recommendationService.getRecommendedProjects(carnet, allProjects);

    res.json(recommendedProjects);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener proyectos recomendados" });
  }
});

// GET /proyectos/debug/:carnet
router.get("/debug/:carnet", async (req, res) => {
    try {
        const { carnet } = req.params;        
        const pool = await getConnection();
        const result = await pool.request()
            .input("carnet", carnet)
            .query(`SELECT * FROM vProyectosResumen ORDER BY tipoProyecto, nombreProyecto`);

        const allProjects = result.recordset;
        console.log(`📦 Proyectos encontrados: ${allProjects.length}`);

        // Probar el servicio de recomendación
        const recommended = await recommendationService.getRecommendedProjects(carnet, allProjects);
        
        res.json({
            debug: true,
            carnet: carnet,
            proyectosOriginales: allProjects.length,
            proyectosRecomendados: recommended.length,
            recomendaciones: recommended.slice(0, 5), // Solo primeros 5 para debug
            mensaje: "Endpoint de debug - revisa los logs del servidor"
        });

    } catch (err) {
        console.error('❌ Error en debug:', err);
        res.status(500).json({ error: "Error en debug", details: err });
    }
});

export default router;
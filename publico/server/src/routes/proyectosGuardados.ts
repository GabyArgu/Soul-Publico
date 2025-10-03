import { Router } from "express";
import { getConnection } from "../db";
import sql from "mssql";

const router = Router();


router.get("/verificar", async (req, res) => {
    const { userId, proyectoId } = req.query;

    if (!userId || !proyectoId) {
        return res.status(400).json({ error: "Faltan parámetros: userId o proyectoId" });
    }

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("idUsuario", userId)
            .input("idProyecto", proyectoId)
            .query(`
                SELECT 1 AS existe 
                FROM proyectosGuardados
                WHERE idUsuario = @idUsuario AND idProyecto = @idProyecto
            `);

        const estaGuardado = result.recordset.length > 0;
        res.json({ estaGuardado });
    } catch (error) {
        console.error("Error al verificar guardado:", error);
        res.status(500).json({ error: "Error al verificar guardado" });
    }
});

router.post("/", async (req, res) => {
    const { idUsuario, idProyecto, guardadoEn } = req.body;

    if (!idUsuario || !idProyecto) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    try {
        const pool = await getConnection();
        await pool.request()
            .input("idUsuario", idUsuario)
            .input("idProyecto", idProyecto)
            .input("guardadoEn", guardadoEn || new Date().toISOString())
            .query(`
                INSERT INTO proyectosGuardados (idUsuario, idProyecto, guardadoEn)
                VALUES (@idUsuario, @idProyecto, @guardadoEn)
            `);

        res.status(201).json({ message: "Proyecto guardado correctamente" });
    } catch (error) {
        console.error("Error al guardar proyecto:", error);
        res.status(500).json({ error: "Error al guardar proyecto" });
    }
});

router.delete("/", async (req, res) => {
    const { userId, proyectoId } = req.query;

    if (!userId || !proyectoId) {
        return res.status(400).json({ error: "Faltan parámetros: userId o proyectoId" });
    }

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("idUsuario", userId)
            .input("idProyecto", proyectoId)
            .query(`
                DELETE FROM proyectosGuardados
                WHERE idUsuario = @idUsuario AND idProyecto = @idProyecto
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Registro no encontrado" });
        }

        res.json({ message: "Proyecto desguardado correctamente" });
    } catch (error) {
        console.error("Error al eliminar guardado:", error);
        res.status(500).json({ error: "Error al eliminar guardado" });
    }
});

router.get("/", async (req, res) => {
    try {
        // Desestructurar parámetros de la query
        const { search, habilidad, carrera, idioma, minHoras, maxHoras, carnet } = req.query;

        // Validación básica para carnet
        if (!carnet) {
            console.warn("⚠️ No se proporcionó carnet en la query");
            return res.status(400).json({ error: "Debe proporcionar el carnet para filtrar los proyectos guardados" });
        }

        const pool = await getConnection();

        // Construcción dinámica de la consulta
        let query = `
            SELECT 
                idProyecto,
                carnetUsuario  as carnet,
                nombreProyecto as titulo,
                descripcion,
                capacidad,
                horasServicio as horas,
                tipoProyecto,
                carrerasRelacionadas,
                habilidadesRelacionadas,
                idiomasRelacionados
            FROM vProyectosGuardadosResumen
            WHERE carnetUsuario  = @carnet
        `;

        if (search) {
            query += ` AND (nombreProyecto LIKE '%' + @search + '%' OR descripcion LIKE '%' + @search + '%')`;
        }
        if (habilidad) {
            query += ` AND habilidadesRelacionadas LIKE '%' + @habilidad + '%'`;
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

        // Ejecutar la consulta con tipos definidos
        const request = pool.request()
            .input("carnet", sql.NVarChar(30), carnet)
            .input("search", sql.NVarChar(100), search || "")
            .input("habilidad", sql.NVarChar(100), habilidad || "")
            .input("carrera", sql.NVarChar(100), carrera || "")
            .input("idioma", sql.NVarChar(100), idioma || "")
            .input("minHoras", sql.Int, minHoras || 0)
            .input("maxHoras", sql.Int, maxHoras || 1000);

        const result = await request.query(query);

        res.json(result.recordset);

    } catch (err) {
        console.error("❌ [ERROR] en GET /api (proyectos guardados):", err);
        res.status(500).json({ error: "Error al obtener proyectos guardados", detalles: err });
    }
});

export default router;

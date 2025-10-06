// routes/aplicaciones.ts
import { Router } from "express";
import { getConnection } from "../db";
import sql from "mssql";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

const router = Router();

// GET /api/aplicaciones?search=&minHoras=&maxHoras=&institucion=&estado=&carnet=&idioma=&carrera=&habilidad=

router.get("/", async (req, res) => {
    const { 
        search, 
        minHoras, 
        maxHoras, 
        institucion, 
        estado, 
        carnet,
        idioma,
        carrera,
        habilidad,
        modalidad // ✅ AGREGAR ESTE PARÁMETRO
    } = req.query;

    if (!carnet) {
        return res.status(400).json({ error: "Debe proporcionar el carnet del usuario" });
    }

    try {
        const pool = await getConnection();

        let query = `
            SELECT 
                idProyecto AS idProyecto,
                idAplicacion AS idAplicacion,
                nombreProyecto AS titulo,
                descripcion,
                modalidad,
                nombreInstitucion AS institucion,
                horasServicio AS horas,
                nombreEstadoAplicacion AS estado,
                carrerasRelacionadas,
                habilidadesRelacionadas,
                idiomasRelacionados
            FROM vAplicacionesUsuarioResumen
            WHERE carnetUsuario = @carnet
        `;

        // Aplicar filtros
        if (search) {
            query += ` AND (nombreProyecto LIKE '%' + @search + '%' OR descripcion LIKE '%' + @search + '%')`;
        }
        if (minHoras) {
            query += ` AND horasServicio >= @minHoras`;
        }
        if (maxHoras) {
            query += ` AND horasServicio <= @maxHoras`;
        }
        if (institucion) {
            query += ` AND nombreInstitucion LIKE '%' + @institucion + '%'`;
        }
        if (estado) {
            query += ` AND nombreEstadoAplicacion LIKE '%' + @estado + '%'`;
        }
        if (idioma) {
            query += ` AND idiomasRelacionados LIKE '%' + @idioma + '%'`;
        }
        if (carrera) {
            query += ` AND carrerasRelacionadas LIKE '%' + @carrera + '%'`;
        }
        if (habilidad) {
            query += ` AND habilidadesRelacionadas LIKE '%' + @habilidad + '%'`;
        }
        if (modalidad) { // ✅ AGREGAR ESTE FILTRO
            query += ` AND modalidad LIKE '%' + @modalidad + '%'`;
        }

        query += " ORDER BY nombreProyecto";

        const request = pool.request()
            .input("carnet", sql.NVarChar(30), carnet)
            .input("search", sql.NVarChar(100), search || "")
            .input("minHoras", sql.Int, parseInt(minHoras as string) || 0)
            .input("maxHoras", sql.Int, parseInt(maxHoras as string) || 1000)
            .input("institucion", sql.NVarChar(100), institucion || "")
            .input("estado", sql.NVarChar(50), estado || "")
            .input("idioma", sql.NVarChar(100), idioma || "")
            .input("carrera", sql.NVarChar(100), carrera || "")
            .input("habilidad", sql.NVarChar(100), habilidad || "")
            .input("modalidad", sql.NVarChar(100), modalidad || ""); // ✅ AGREGAR ESTE INPUT

        const result = await request.query(query);

        res.json(result.recordset);

    } catch (error) {
        console.error("Error obteniendo aplicaciones filtradas:", error);
        res.status(500).json({ error: "Error obteniendo aplicaciones", detalles: error });
    }
});

// GET /api/aplicaciones/detalle/:idAplicacion
router.get("/detalle/:idAplicacion", async (req, res) => {
    const { idAplicacion } = req.params;

    try {
        const pool = await getConnection();
        
        const query = `
            SELECT 
                idAplicacion,
                idProyecto,
                nombreProyecto AS titulo,
                descripcion,
                capacidad,
                horasServicio AS horas,
                fechaInicio,
                fechaFin,
                fechaAplicacion,
                nombreInstitucion AS institucion,
                nombreContacto,
                emailContacto,
                telefonoContacto,
                carrerasRelacionadas,
                habilidadesRelacionadas,
                idiomasRelacionados,
                nombreEstadoAplicacion AS estado
            FROM vAplicacionesUsuarioResumen
            WHERE idAplicacion = @idAplicacion
        `;

        const result = await pool.request()
            .input("idAplicacion", sql.Int, idAplicacion)
            .query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Aplicación no encontrada" });
        }

        // Necesitamos obtener las fechas específicas de cada estado desde la tabla aplicaciones
        const aplicacionDetalle = await pool.request()
            .input("idAplicacion", sql.Int, idAplicacion)
            .query(`
                SELECT 
                    enviadoEn,
                    revisadoEn,
                    aceptadoEn,
                    rechazadoEn,
                    finalizadoEn,
                    urlCartaAceptacion
                FROM aplicaciones 
                WHERE idAplicacion = @idAplicacion
            `);

        const aplicacion = {
            ...result.recordset[0],
            ...aplicacionDetalle.recordset[0]
        };

        res.json(aplicacion);

    } catch (error) {
        console.error("Error obteniendo detalles de aplicación:", error);
        res.status(500).json({ error: "Error obteniendo detalles de aplicación", detalles: error });
    }
});

// GET /api/aplicaciones/verificar?userId=1&proyectoId=2
router.get("/verificar", async (req, res) => {
    const { userId, proyectoId } = req.query;

    if (!userId || !proyectoId) {
        return res.status(400).json({ error: "Faltan parámetros userId o proyectoId" });
    }

    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input("idUsuario", sql.Int, parseInt(userId as string))
            .input("idProyecto", sql.Int, parseInt(proyectoId as string))
            .query(`
                SELECT COUNT(*) as total
                FROM aplicaciones
                WHERE idUsuario = @idUsuario AND idProyecto = @idProyecto
            `);

        const yaAplico = result.recordset[0].total > 0;
        res.json({ yaAplico });

    } catch (err) {
        console.error("Error verificando aplicación:", err);
        res.status(500).json({ error: "Error verificando aplicación" });
    }
});

// POST crear aplicación
router.post("/", async (req, res) => {
    try {
        const { idUsuario, idProyecto, idEstado, urlCartaAceptacion } = req.body;
        const pool = await getConnection();
        await pool.request()
            .input("idUsuario", sql.Int, idUsuario)
            .input("idProyecto", sql.Int, idProyecto)
            .input("idEstado", sql.TinyInt, idEstado)
            .input("urlCartaAceptacion", sql.NVarChar, urlCartaAceptacion)
            .query("INSERT INTO aplicaciones (idUsuario,idProyecto,idEstado,urlCartaAceptacion) VALUES (@idUsuario,@idProyecto,@idEstado,@urlCartaAceptacion)");
        res.json({ message: "Aplicación creada" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al crear aplicación" });
    }
});

// Helper para obtener la ruta local del CV
function getLocalPathFromUrl(url: string) {
    if (!url) return null;
    const fileName = path.basename(url); // ej: cv-123456.pdf
    // Ajusta esta ruta según dónde estén tus CVs en el disco
    const localFolder = path.join(__dirname, "../uploads"); 
    const localPath = path.join(localFolder, fileName);

    if (!fs.existsSync(localPath)) {
        console.error("No se encontró el archivo local:", localPath);
        return null;
    }

    return localPath;
}

// POST /api/aplicaciones/aplicar
router.post("/aplicar", async (req, res) => {
    const { idProyecto, usuario } = req.body;
    // usuario = { idUsuario, nombreCompleto, email, urlCv }

    try {
        if (!usuario || !usuario.urlCv) {
            return res.status(400).json({ error: "No tienes CV cargado en tu perfil" });
        }

        const pool = await getConnection();

        // 1️⃣ Traer datos del proyecto + institución
        const result = await pool.request()
            .input("idProyecto", sql.Int, idProyecto)
            .query(`
                SELECT 
                    idProyecto,
                    nombreProyecto as titulo,
                    nombreInstitucion,
                    nombreContacto,
                    telefonoContacto,
                    emailContacto
                FROM vProyectosResumen
                WHERE idProyecto = @idProyecto
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Proyecto no encontrado" });
        }

        const proyecto = result.recordset[0];

        // 2️⃣ Insertar aplicación en la tabla `aplicaciones`
        await pool.request()
            .input("idUsuario", sql.Int, usuario.idUsuario)
            .input("idProyecto", sql.Int, idProyecto)
            .input("idEstado", sql.Int, 1) // Enviado
            .input("enviadoEn", sql.DateTime, new Date())
            .input("urlCartaAceptacion", sql.NVarChar, null)
            .query(`
                INSERT INTO aplicaciones 
                (idUsuario, idProyecto, idEstado, enviadoEn, urlCartaAceptacion)
                VALUES (@idUsuario, @idProyecto, @idEstado, @enviadoEn, @urlCartaAceptacion)
            `);

        // 3️⃣ Preparar el adjunto del CV
        const cvLocalPath = getLocalPathFromUrl(usuario.urlCv);
        if (!cvLocalPath) {
            return res.status(400).json({ error: "No se encontró el archivo local del CV" });
        }

        // 4️⃣ Configurar Nodemailer
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "gabmendez4869@gmail.com",
                pass: "hajkoattnekdfojv",
            },
        });

        // Ruta del logo
        const logoPath = "C:\\Users\\inuxb\\OneDrive\\Escritorio\\Proyecto de catedra\\Soul-Publico\\publico\\assets\\images\\logo.png";

        const mailOptions = {
            from: '"Aplicaciones SOUL" <gabmendez4869@gmail.com>',
            to: proyecto.emailContacto,
            subject: `Nueva aplicación al proyecto ${proyecto.titulo}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:8px; overflow:hidden;">
                    
                    <!-- Header -->
                    <div style="background-color:#2666DE; text-align:center; padding:10px;">
                        <img src="cid:logoSoul" alt="SOUL" style="width:320px; height:auto;">
                    </div>

                    <!-- Body -->
                    <div style="background-color:#fff; padding:25px; color:#333;">
                        <h2 style="color:#2666DE; margin-top:0;">Nueva aplicación recibida 📬</h2>
                        <p>Hola <strong>${proyecto.nombreContacto || "equipo"}</strong>,</p>
                        <p>El usuario <strong>${usuario.nombreCompleto}</strong> (${usuario.email}) ha aplicado al proyecto <strong>${proyecto.titulo}</strong> de la institución <strong>${proyecto.nombreInstitucion}</strong>.</p>
                        <p>📎 Se adjunta el CV del postulante en este correo.</p>

                        <p style="margin-top:20px; font-size:14px; color:#555;">
                            Si estás interesado en aceptar la solicitud, favor de ponerte en contacto con el <strong>Departamento de Proyección Social de la UDB</strong>, o adjuntar la carta de aceptación al correo del usuario (<strong>${usuario.email}</strong>).
                        </p>
                    </div>

                    <!-- Footer -->
                    <div style="background-color:#F9DC50; text-align:center; padding:15px; font-size:12px; color:#333;">
                        Este es un mensaje automático enviado desde <strong>SOUL</strong>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: path.basename(cvLocalPath),
                    path: cvLocalPath
                },
                {
                    filename: "logo.png",
                    path: logoPath,
                    cid: "logoSoul"
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        res.json({ ok: true, message: "Aplicación enviada y registrada correctamente" });

    } catch (error) {
        console.error("Error en aplicar:", error);
        res.status(500).json({ error: "Error procesando aplicación" });
    }
});

export default router;
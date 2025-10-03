// routes/notificaciones.js - VERSIÓN CORRECTA
import { Router } from "express";
import sql from "mssql";

const router = Router();

// Obtener notificaciones del usuario
router.get("/:carnet", async (req, res) => {
    try {
        const { carnet } = req.params;
        console.log("🔔 Solicitando notificaciones para:", carnet);

        const request = new sql.Request();

        // PRIMERO: Buscar el idUsuario usando el carnet
        const usuarioResult = await request
            .input("carnet", sql.VarChar, carnet)
            .query("SELECT idUsuario FROM usuarios WHERE carnet = @carnet");

        if (usuarioResult.recordset.length === 0) {
            console.log("❌ Usuario no encontrado");
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const idUsuario = usuarioResult.recordset[0].idUsuario;
        console.log("✅ ID de usuario encontrado:", idUsuario);

        // SEGUNDO: Buscar notificaciones usando el idUsuario
        const query = `
            SELECT 
    n.idNotificacion,
    n.idUsuario,
    n.idProyecto,
    n.idAplicacion,
    n.titulo,
    n.cuerpo,
    n.estaLeida,
    CONVERT(VARCHAR, n.fechaCreación, 120) as fechaCreacion,
    p.nombre AS proyectoNombre,
    ea.nombre AS aplicacionEstado
FROM notificaciones n
LEFT JOIN proyectos p ON n.idProyecto = p.idProyecto
LEFT JOIN aplicaciones a ON n.idAplicacion = a.idAplicacion
LEFT JOIN estadosAplicacion ea ON a.idEstado = ea.idEstado
WHERE n.idUsuario = @idUsuario
ORDER BY n.fechaCreación DESC

        `;

        console.log("📝 Ejecutando query:", query);
        const result = await request
            .input("idUsuario", sql.Int, idUsuario)
            .query(query);

        console.log("✅ Notificaciones encontradas:", result.recordset.length);
        console.log("📋 Datos:", result.recordset);

        res.json(result.recordset);
    } catch (error) {
        console.error("❌ Error obteniendo notificaciones:", error);
        res.status(500).json({ error: "Error al obtener notificaciones" });
    }
});

// Marcar notificación como leída
router.put("/:idNotificacion/leer", async (req, res) => {
    try {
        const { idNotificacion } = req.params;
        console.log("📝 Marcando notificación como leída:", idNotificacion);

        const request = new sql.Request();
        await request
            .input("idNotificacion", sql.Int, idNotificacion)
            .query(`
                UPDATE notificaciones 
                SET estaLeida = 1 
                WHERE idNotificacion = @idNotificacion
            `);

        console.log("✅ Notificación marcada como leída");
        res.json({ message: "Notificación marcada como leída" });
    } catch (error) {
        console.error("❌ Error marcando notificación como leída:", error);
        res.status(500).json({ error: "Error al marcar notificación como leída" });
    }
});

// Marcar todas las notificaciones como leídas
router.put("/usuario/:carnet/leer-todas", async (req, res) => {
    try {
        const { carnet } = req.params;
        console.log("📝 Marcando todas como leídas para:", carnet);

        const request = new sql.Request();

        // Primero obtener el idUsuario usando el carnet
        const usuarioResult = await request
            .input("carnet", sql.VarChar, carnet)
            .query("SELECT idUsuario FROM usuarios WHERE carnet = @carnet");

        if (usuarioResult.recordset.length === 0) {
            console.log("❌ Usuario no encontrado");
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        const idUsuario = usuarioResult.recordset[0].idUsuario;

        // Marcar todas las notificaciones como leídas
        await request
            .input("idUsuario", sql.Int, idUsuario)
            .query(`
                UPDATE notificaciones 
                SET estaLeida = 1 
                WHERE idUsuario = @idUsuario AND estaLeida = 0
            `);

        console.log("✅ Todas las notificaciones marcadas como leídas");
        res.json({ message: "Todas las notificaciones marcadas como leídas" });
    } catch (error) {
        console.error("❌ Error marcando notificaciones como leídas:", error);
        res.status(500).json({ error: "Error al marcar notificaciones como leídas" });
    }
});

export default router;
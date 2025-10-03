import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import departamentosRoutes from "./routes/departamentos";
import municipiosRoutes from "./routes/municipios";
import carrerasRoutes from "./routes/carreras";
import idiomasRoutes from "./routes/idiomas";
import idiomasNivelesRoutes from "./routes/nivelesIdioma";
import habilidadesRoutes from "./routes/habilidades";
import opcionesDisponibilidadRoutes from "./routes/opcionesDisponibilidad";
import usuariosRoutes from "./routes/usuarios";
import uploadRoutes from "./routes/upload"; 
import proyectosRoutes from "./routes/proyectos";
import institucionesRoutes from "./routes/instituciones";
import modalidadesRoutes from "./routes/modalidades";
import proyectosGuardadosRoutes from "./routes/proyectosGuardados";
import notificacionesRoutes from "./routes/notificaciones";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 4000;

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/departamentos", departamentosRoutes);
app.use("/api/municipios", municipiosRoutes);
app.use("/api/carreras", carrerasRoutes);
app.use("/api/idiomas", idiomasRoutes);
app.use("/api/niveles", idiomasNivelesRoutes);
app.use("/api/habilidades", habilidadesRoutes);
app.use("/api/disponibilidad", opcionesDisponibilidadRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api", uploadRoutes); 
app.use("/api/proyectos", proyectosRoutes);
app.use("/api/instituciones", institucionesRoutes);
app.use("/api/modalidades", modalidadesRoutes);
app.use("/api/proyectos-guardados", proyectosGuardadosRoutes);
app.use("/api/notificaciones", notificacionesRoutes);

app.listen(4000, "0.0.0.0", () => {
    console.log("Servidor corriendo en http://0.0.0.0:4000");
});
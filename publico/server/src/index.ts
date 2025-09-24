// server/src/index.ts
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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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


app.listen(4000, "0.0.0.0", () => {
  console.log("Servidor corriendo en http://0.0.0.0:4000");
});

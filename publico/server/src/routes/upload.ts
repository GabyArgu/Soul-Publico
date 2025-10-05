import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";

const router = Router();

// Configurar multer para guardar archivos en la carpeta 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generar un nombre de archivo único para evitar colisiones
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Solo se permiten archivos PDF"));
        }
    },
});

// Endpoint para subir un solo archivo (ej. CV)
router.post("/cv", upload.single("cv"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No se subió ningún archivo" });
    }
    // Devolver la ruta del archivo para guardarla en la base de datos
    const serverUrl = "https://d06a6c5dfc30.ngrok-free.app"; // Asegúrate de que esta es la IP correcta
const fileUrl = `${serverUrl}/uploads/${req.file.filename}`;
res.json({ url: fileUrl, message: "Archivo subido con éxito" });
});

export default router;
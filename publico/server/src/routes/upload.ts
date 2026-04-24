// server / src/routes/upload.ts
import { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + fileExtension);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos PDF"));
    }
  },
});

router.post("/cv", upload.single("cv"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se subió ningún archivo" });
  }

  // USAMOS LA VARIABLE DE ENTORNO. Si no existe, por defecto usa localhost
  const serverUrl = process.env.SERVER_URL || "http://localhost:4000";
  
  const fileUrl = `${serverUrl}/uploads/${req.file.filename}`;
  
  res.json({ url: fileUrl, message: "Archivo subido con éxito" });
});

export default router;
/**
 * Utilidades para Manejo de Archivos
 * 
 * Por ahora, solo simula la subida de archivos guardando el nombre/path.
 * En producción, esto debería subir los archivos a un servicio de almacenamiento
 * (AWS S3, Google Cloud Storage, etc.) o al sistema de archivos del servidor.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento (por ahora solo guarda en memoria y devuelve el nombre)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp + nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Filtro para aceptar solo ciertos tipos de archivos
const fileFilter = (req, file, cb) => {
  // Permitir imágenes y PDFs
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos JPEG, PNG o PDF'));
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: fileFilter
});

/**
 * Función helper para obtener la URL/path del archivo subido
 * Por ahora retorna el path relativo, en producción debería retornar URL completa
 */
const getFileUrl = (filename) => {
  if (!filename) return null;
  // En producción, esto debería ser una URL completa:
  // return `https://storage.example.com/uploads/${filename}`;
  return `/uploads/${filename}`;
};

module.exports = {
  upload,
  getFileUrl
};




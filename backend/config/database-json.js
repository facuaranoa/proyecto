/**
 * Sistema de Base de Datos con Archivos JSON
 * 
 * Este módulo maneja el almacenamiento de datos usando archivos JSON.
 * Es una alternativa simple a PostgreSQL para desarrollo local.
 */

const fs = require('fs').promises;
const path = require('path');

// Directorio donde se guardan los archivos JSON
const DATA_DIR = path.join(__dirname, '..', 'data');

// Archivos JSON para cada tabla
const FILES = {
  usuariosClientes: path.join(DATA_DIR, 'usuariosClientes.json'),
  taskers: path.join(DATA_DIR, 'taskers.json'),
  tareas: path.join(DATA_DIR, 'tareas.json'),
  solicitudesTareas: path.join(DATA_DIR, 'solicitudesTareas.json'),
  admins: path.join(DATA_DIR, 'admins.json'),
  calificaciones: path.join(DATA_DIR, 'calificaciones.json'),
  passwordResetTokens: path.join(DATA_DIR, 'passwordResetTokens.json')
};

// Asegurar que el directorio existe
const ensureDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error al crear directorio de datos:', error);
  }
};

// Leer datos de un archivo JSON
const readFile = async (fileKey) => {
  try {
    const filePath = FILES[fileKey];
    if (!filePath) {
      throw new Error(`Archivo no encontrado en FILES: ${fileKey}`);
    }
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe, retornar array vacío
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

// Escribir datos a un archivo JSON
const writeFile = async (fileKey, data) => {
  try {
    const filePath = FILES[fileKey];
    if (!filePath) {
      throw new Error(`Archivo no encontrado en FILES: ${fileKey}`);
    }
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error al escribir archivo ${fileKey}:`, error);
    throw error;
  }
};

// Función para probar la conexión (solo verifica que el directorio existe)
const testConnection = async () => {
  try {
    await ensureDataDir();
    console.log('✅ Sistema de archivos JSON inicializado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar sistema de archivos JSON:', error.message);
    return false;
  }
};

// Inicializar archivos si no existen
const initializeFiles = async () => {
  await ensureDataDir();
  
  // Crear archivos vacíos si no existen
  for (const [key, filePath] of Object.entries(FILES)) {
    try {
      await fs.access(filePath);
    } catch {
      // Archivo no existe, crearlo con array vacío
      await writeFile(key, []);
    }
  }
};

// Inicializar al cargar el módulo
initializeFiles().catch(console.error);

module.exports = {
  readFile,
  writeFile,
  testConnection,
  FILES,
  ensureDataDir
};


/**
 * Modelo Categoria - Versión JSON
 * 
 * Maneja la configuración de categorías de servicios.
 */

const { readFile, writeFile } = require('../config/database-json');

const FILE_KEY = 'categorias';

class Categoria {
  // Obtener todas las categorías activas
  static async findAll() {
    const data = await readFile(FILE_KEY);
    return data.categorias.filter(cat => cat.activa).sort((a, b) => a.orden - b.orden);
  }

  // Obtener todas las categorías (incluyendo inactivas)
  static async findAllIncludingInactive() {
    const data = await readFile(FILE_KEY);
    return data.categorias.sort((a, b) => a.orden - b.orden);
  }

  // Obtener una categoría por ID
  static async findById(categoriaId) {
    const data = await readFile(FILE_KEY);
    return data.categorias.find(cat => cat.id === categoriaId);
  }

  // Obtener una subcategoría por ID
  static async findSubcategoriaById(categoriaId, subcategoriaId) {
    const categoria = await this.findById(categoriaId);
    if (!categoria) return null;
    return categoria.subcategorias.find(sub => sub.id === subcategoriaId);
  }

  // Validar si un tipo de servicio es válido
  static async isValidTipoServicio(tipoServicio) {
    const categorias = await this.findAll();
    return categorias.some(cat => cat.id === tipoServicio);
  }

  // Actualizar todas las categorías (para admin)
  static async updateAll(categorias) {
    const data = await readFile(FILE_KEY);
    data.categorias = categorias;
    await writeFile(FILE_KEY, data);
    return data;
  }

  // Agregar nueva categoría
  static async create(categoriaData) {
    const data = await readFile(FILE_KEY);
    const nuevaCategoria = {
      ...categoriaData,
      id: categoriaData.id || categoriaData.nombre.toUpperCase().replace(/\s+/g, '_'),
      activa: categoriaData.activa !== undefined ? categoriaData.activa : true,
      orden: categoriaData.orden || data.categorias.length + 1,
      subcategorias: categoriaData.subcategorias || []
    };
    data.categorias.push(nuevaCategoria);
    await writeFile(FILE_KEY, data);
    return nuevaCategoria;
  }

  // Actualizar una categoría
  static async update(categoriaId, categoriaData) {
    const data = await readFile(FILE_KEY);
    const index = data.categorias.findIndex(cat => cat.id === categoriaId);
    if (index === -1) {
      throw new Error('Categoría no encontrada');
    }
    data.categorias[index] = { ...data.categorias[index], ...categoriaData };
    await writeFile(FILE_KEY, data);
    return data.categorias[index];
  }

  // Eliminar una categoría (marcar como inactiva)
  static async delete(categoriaId) {
    return await this.update(categoriaId, { activa: false });
  }

  // Restaurar una categoría (marcar como activa)
  static async restore(categoriaId) {
    return await this.update(categoriaId, { activa: true });
  }
}

module.exports = Categoria;


/**
 * Modelo PasswordResetToken - Versión JSON
 * 
 * Almacena tokens temporales para recuperación de contraseña.
 * Los tokens expiran después de 1 hora.
 */

const { readFile, writeFile } = require('../config/database-json');
const crypto = require('crypto');

const FILE_KEY = 'passwordResetTokens';

class PasswordResetToken {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || null;
    this.token = data.token || null;
    this.user_id = data.user_id || null;
    this.user_type = data.user_type || null; // 'cliente' o 'tasker'
    this.expires_at = data.expires_at || null;
    this.used = data.used !== undefined ? data.used : false;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  // Generar token único
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Verificar si el token ha expirado
  isExpired() {
    return new Date() > new Date(this.expires_at);
  }

  // Verificar si el token es válido
  isValid() {
    return !this.used && !this.isExpired();
  }

  // Guardar token
  async save() {
    let tokens = await readFile(FILE_KEY);
    
    if (this.id === null) {
      // Nuevo token
      const maxId = tokens.length > 0 
        ? Math.max(...tokens.map(t => t.id || 0))
        : 0;
      this.id = maxId + 1;
      this.createdAt = new Date().toISOString();
      tokens.push(this);
    } else {
      // Actualizar token existente
      const index = tokens.findIndex(t => t.id === this.id);
      if (index !== -1) {
        tokens[index] = this;
      } else {
        throw new Error('Token no encontrado');
      }
    }

    await writeFile(FILE_KEY, tokens);
    return this;
  }

  // Marcar token como usado
  async markAsUsed() {
    this.used = true;
    return await this.save();
  }

  // Método estático: encontrar por token
  static async findByToken(token) {
    const tokens = await readFile(FILE_KEY);
    const tokenData = tokens.find(t => t.token === token);
    return tokenData ? new PasswordResetToken(tokenData) : null;
  }

  // Método estático: encontrar por email
  static async findByEmail(email) {
    const tokens = await readFile(FILE_KEY);
    const tokenData = tokens.find(t => t.email === email && !t.used && new Date() < new Date(t.expires_at));
    return tokenData ? new PasswordResetToken(tokenData) : null;
  }

  // Método estático: invalidar todos los tokens de un email
  static async invalidateAllForEmail(email) {
    const tokens = await readFile(FILE_KEY);
    tokens.forEach(t => {
      if (t.email === email && !t.used) {
        t.used = true;
      }
    });
    await writeFile(FILE_KEY, tokens);
  }

  // Método estático: limpiar tokens expirados
  static async cleanExpired() {
    const tokens = await readFile(FILE_KEY);
    const now = new Date();
    const validTokens = tokens.filter(t => new Date(t.expires_at) > now);
    await writeFile(FILE_KEY, validTokens);
  }
}

module.exports = PasswordResetToken;


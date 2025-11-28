// Script para probar diferentes contraseñas de PostgreSQL
const { Sequelize } = require('sequelize');
require('dotenv').config();

const passwords = ['Lucrecia2571', 'postgres', '', 'admin', 'password', '123456'];

async function testPasswords() {
  console.log('🔍 Probando contraseñas comunes de PostgreSQL...\n');

  for (const password of passwords) {
    console.log(`Probando contraseña: '${password}'`);

    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      password,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false
      }
    );

    try {
      await sequelize.authenticate();
      console.log(`✅ ¡CONTRASEÑA CORRECTA! La contraseña es: '${password}'`);
      console.log('\nAhora puedes actualizar tu archivo .env con esta contraseña.');
      process.exit(0);
    } catch (error) {
      console.log(`❌ Contraseña incorrecta`);
    }

    await sequelize.close();
  }

  console.log('\n❌ Ninguna de las contraseñas comunes funcionó.');
  console.log('Por favor, verifica tu contraseña en pgAdmin o dime cuál es.');
}

testPasswords();
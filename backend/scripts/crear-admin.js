/**
 * Script para crear un usuario administrador
 * 
 * Uso: node scripts/crear-admin.js
 */

const Admin = require('../models/Admin');

async function crearAdmin() {
  try {
    console.log('🔐 Creando usuario administrador...\n');

    // Datos del admin (puedes modificarlos)
    const adminData = {
      email: 'admin@ayudaaltoque.com',
      password: 'admin123', // Cambia esto por una contraseña segura
      nombre: 'Admin',
      apellido: 'Sistema',
      telefono: '+5491123456789'
    };

    // Verificar si ya existe
    const existe = await Admin.findOne({
      where: { email: adminData.email }
    });

    if (existe) {
      console.log('⚠️  Ya existe un admin con ese email:', adminData.email);
      console.log('   Si quieres crear otro, cambia el email en el script.\n');
      return;
    }

    // Crear el admin
    const admin = await Admin.create(adminData);

    console.log('✅ Admin creado exitosamente!\n');
    console.log('📧 Email:', admin.email);
    console.log('👤 Nombre:', admin.nombre, admin.apellido);
    console.log('🆔 ID:', admin.id);
    console.log('\n💡 Puedes hacer login con:');
    console.log('   POST http://localhost:3000/api/auth/login');
    console.log('   Body: { "email": "' + adminData.email + '", "password": "' + adminData.password + '" }');
    console.log('\n⚠️  Recuerda cambiar la contraseña después del primer login!\n');

  } catch (error) {
    console.error('❌ Error al crear admin:', error.message);
    process.exit(1);
  }
}

// Ejecutar
crearAdmin();


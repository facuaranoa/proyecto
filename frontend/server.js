const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🌐 Frontend corriendo en http://localhost:${PORT}`);
    console.log(`🔗 API Backend en http://localhost:3000`);
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Para permitir peticiones desde el frontend de React
const authRoutes = require('./src/routes/authRoutes');
const casoRoutes = require('./src/routes/casoRoutes');
const fiscalRoutes = require('./src/routes/fiscalRoutes');
const utilRoutes = require('./src/routes/utilRoutes');
const { poolPromise } = require('./src/config/db'); // Para asegurar que la conexión a la DB se establezca

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Permite todas las CORS requests. En producción, configurar origen específico.
app.use(express.json()); // Habilitar body-parser para JSON

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/casos', casoRoutes);
app.use('/api/fiscales', fiscalRoutes);
app.use('/api/utils', utilRoutes); // Para tipos de delito, estados, etc.

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API del Ministerio Público funcionando!');
});

// Iniciar el servidor
const startServer = async () => {
    try {
        // Asegurar que la conexión a la base de datos se ha establecido
        await poolPromise;
        app.listen(PORT, () => console.log(`Servidor Express escuchando en el puerto ${PORT}`));
    } catch (err) {
        console.error('No se pudo iniciar el servidor debido a un error de conexión a la DB:', err);
        process.exit(1); // Salir si no se puede conectar a la DB
    }
};

startServer();
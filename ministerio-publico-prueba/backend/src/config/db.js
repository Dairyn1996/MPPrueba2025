require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10), // Convertir a número
    options: {
        encrypt: false, // Para SQL Server en Docker o local sin SSL
        trustServerCertificate: true // Cambiar a false en producción y usar certificado
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Conectado a SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Error al conectar a la base de datos:', err);
        // Terminar el proceso si no se puede conectar a la DB (crítico)
        process.exit(1);
    });

module.exports = {
    sql,
    poolPromise
};
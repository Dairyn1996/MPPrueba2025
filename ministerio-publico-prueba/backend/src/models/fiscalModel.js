const { sql, poolPromise } = require('../config/db');

class Fiscal {
    static async obtenerTodos() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().execute('sp_ObtenerFiscales');
            return result.recordset;
        } catch (err) {
            console.error('Error al obtener fiscales:', err.message);
            throw err;
        }
    }
    // Puedes añadir más métodos como obtener por ID, crear, actualizar, eliminar si es necesario.
    // Solo si el frontend los necesitará para una gestión completa de fiscales.
}

module.exports = Fiscal;
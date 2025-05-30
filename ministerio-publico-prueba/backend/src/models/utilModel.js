const { sql, poolPromise } = require('../config/db');

class Util {
    static async obtenerTiposDelito() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().execute('sp_ObtenerTiposDelito');
            return result.recordset;
        } catch (err) {
            console.error('Error al obtener tipos de delito:', err.message);
            throw err;
        }
    }

    static async obtenerEstadosCaso() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().execute('sp_ObtenerEstadosCaso');
            return result.recordset;
        } catch (err) {
            console.error('Error al obtener estados de caso:', err.message);
            throw err;
        }
    }

    static async obtenerFiscalias() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().execute('sp_ObtenerFiscalias');
            return result.recordset;
        } catch (err) {
            console.error('Error al obtener fiscalías:', err.message);
            throw err;
        }
    }

    static async obtenerLogsReasignacion() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().execute('sp_ObtenerLogsReasignacion');
            return result.recordset;
        } catch (err) {
            console.error('Error al obtener logs de reasignación:', err.message);
            throw err;
        }
    }
}

module.exports = Util;
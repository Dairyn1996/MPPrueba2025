const { sql, poolPromise } = require('../config/db');

class Caso {
    static async crear(numeroCaso, titulo, descripcion, estadoId, tipoDelitoId, fiscalAsignadoId = null) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            request.input('NumeroCaso', sql.NVarChar(50), numeroCaso);
            request.input('Titulo', sql.NVarChar(255), titulo);
            request.input('Descripcion', sql.NVarChar(sql.MAX), descripcion);
            request.input('EstadoID', sql.Int, estadoId);
            request.input('TipoDelitoID', sql.Int, tipoDelitoId);
            request.input('FiscalAsignadoID', sql.Int, fiscalAsignadoId);
            request.output('CasoID', sql.Int);

            await request.execute('sp_InsertarCaso');
            return request.output.CasoID;

        } catch (err) {
            console.error('Error al crear caso:', err.message);
            throw err;
        }
    }

    static async actualizar(casoId, numeroCaso, titulo, descripcion, estadoId, tipoDelitoId, fiscalAsignadoId = null) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            request.input('CasoID', sql.Int, casoId);
            request.input('NumeroCaso', sql.NVarChar(50), numeroCaso);
            request.input('Titulo', sql.NVarChar(255), titulo);
            request.input('Descripcion', sql.NVarChar(sql.MAX), descripcion);
            request.input('EstadoID', sql.Int, estadoId);
            request.input('TipoDelitoID', sql.Int, tipoDelitoId);
            request.input('FiscalAsignadoID', sql.Int, fiscalAsignadoId);

            await request.execute('sp_ActualizarCaso');
            return true; // Indicar éxito

        } catch (err) {
            console.error('Error al actualizar caso:', err.message);
            throw err;
        }
    }

    static async obtenerTodos() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().execute('sp_ObtenerTodosCasos');
            return result.recordset;
        } catch (err) {
            console.error('Error al obtener todos los casos:', err.message);
            throw err;
        }
    }

    static async obtenerPorId(casoId) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('CasoID', sql.Int, casoId)
                .execute('sp_ObtenerCasoPorID');
            return result.recordset[0];
        } catch (err) {
            console.error('Error al obtener caso por ID:', err.message);
            throw err;
        }
    }

    static async eliminar(casoId) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('CasoID', sql.Int, casoId)
                .execute('sp_EliminarCaso');
            return true;
        } catch (err) {
            console.error('Error al eliminar caso:', err.message);
            throw err;
        }
    }

    static async reasignar(casoId, nuevoFiscalId) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            request.input('CasoID', sql.Int, casoId);
            request.input('NuevoFiscalID', sql.Int, nuevoFiscalId);
            request.output('Resultado', sql.Bit);
            request.output('Mensaje', sql.NVarChar(sql.MAX));

            await request.execute('sp_ReasignarCaso');

            return {
                resultado: request.output.Resultado,
                mensaje: request.output.Mensaje
            };

        } catch (err) {
            console.error('Error al reasignar caso:', err.message);
            throw err;
        }
    }
}

module.exports = Caso;
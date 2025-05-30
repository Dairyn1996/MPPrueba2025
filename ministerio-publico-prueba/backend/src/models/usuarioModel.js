const { sql, poolPromise } = require('../config/db');

class Usuario {
    static async crear(nombreUsuario, contrasenaHash, rolId) {
        try {
            const pool = await poolPromise;
            const request = pool.request();
            request.input('NombreUsuario', sql.NVarChar(100), nombreUsuario);
            request.input('ContrasenaHash', sql.NVarChar(255), contrasenaHash);
            request.input('RolID', sql.Int, rolId);
            request.output('UsuarioID', sql.Int); // Para obtener el ID generado

            await request.execute('sp_InsertarUsuario');
            return request.output.UsuarioID;

        } catch (err) {
            console.error('Error al crear usuario:', err.message);
            throw err;
        }
    }

    static async obtenerPorNombre(nombreUsuario) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('NombreUsuario', sql.NVarChar(100), nombreUsuario)
                .execute('sp_ObtenerUsuarioPorNombre');
            return result.recordset[0];
        } catch (err) {
            console.error('Error al obtener usuario por nombre:', err.message);
            throw err;
        }
    }
}

module.exports = Usuario;
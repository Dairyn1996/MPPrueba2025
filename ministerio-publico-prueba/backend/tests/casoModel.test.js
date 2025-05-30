// Este test es un ejemplo y requerirá un setup más complejo para DB real o mocking.
// Para propósitos de esta prueba técnica, se enfocaría en lógica pura si no se mockea la DB.

jest.mock('../src/config/db');

const Caso = require('../src/models/casoModel');
// const { poolPromise } = require('../src/config/db'); // Podrías necesitar mockear esto

describe('Caso Model - Lógica de Reasignación', () => {
    // Mockear la conexión a la base de datos y la ejecución de SPs
    // En un entorno de prueba real, usarías un paquete como 'jest-mock-extended'
    // o mockearías el 'mssql' pool directamente.
    // Para esta demostración, asumiremos que el SP devuelve los resultados esperados.

    // Mockear poolPromise y request para simular la ejecución del SP
    let mockRequest;
    let mockPool;

    beforeEach(() => {
        mockRequest = {
            input: jest.fn().mockReturnThis(),
            output: jest.fn().mockReturnThis(),
            execute: jest.fn(),
            output: {} // Para simular el retorno del SP
        };

        mockPool = {
            request: jest.fn(() => mockRequest),
        };

        // Jest.mock('../src/config/db', () => ({
        //     poolPromise: Promise.resolve(mockPool),
        //     sql: {
        //         Int: jest.fn(),
        //         NVarChar: jest.fn(),
        //         MAX: jest.fn(),
        //         Bit: jest.fn(),
        //     }
        // }));
        // La línea de arriba es un ejemplo de cómo mockear, pero para que Jest la use
        // correctamente, tendrías que ejecutar Jest con el moduleNameMapper configurado
        // o refactorizar la importación de `db.js`. Para una demo rápida, simplificamos.
    });


    // Test de la lógica de reasignación (simulando resultados del SP)
    test('debería reasignar el caso con éxito si cumple las condiciones', async () => {
        // Simula que el SP_ReasignarCaso retorna éxito
        mockRequest.execute.mockResolvedValueOnce({
            output: { Resultado: 1, Mensaje: 'Caso reasignado con éxito.' }
        });

        const result = await Caso.reasignar(1, 2); // ID de caso y nuevo fiscal
        expect(result.resultado).toBe(1);
        expect(result.mensaje).toBe('Caso reasignado con éxito.');
        expect(mockRequest.input).toHaveBeenCalledWith('CasoID', sql.Int, 1);
        expect(mockRequest.input).toHaveBeenCalledWith('NuevoFiscalID', sql.Int, 2);
        expect(mockRequest.output).toHaveBeenCalledWith('Resultado', sql.Bit);
        expect(mockRequest.output).toHaveBeenCalledWith('Mensaje', sql.NVarChar(sql.MAX));
        expect(mockRequest.execute).toHaveBeenCalledWith('sp_ReasignarCaso');
    });

    test('debería fallar la reasignación si el estado no es pendiente', async () => {
        // Simula que el SP_ReasignarCaso retorna fallo por estado
        mockRequest.execute.mockResolvedValueOnce({
            output: { Resultado: 0, Mensaje: 'El caso no puede ser reasignado porque su estado actual es "En Proceso". Solo se permiten reasignaciones para casos "Pendientes".' }
        });

        const result = await Caso.reasignar(2, 2); // Caso ID 2 (En Proceso), nuevo fiscal
        expect(result.resultado).toBe(0);
        expect(result.mensaje).toContain('estado actual es "En Proceso"');
    });

    test('debería fallar la reasignación si los fiscales no pertenecen a la misma fiscalía', async () => {
        // Simula que el SP_ReasignarCaso retorna fallo por fiscalía
        mockRequest.execute.mockResolvedValueOnce({
            output: { Resultado: 0, Mensaje: 'El nuevo fiscal debe pertenecer a la misma fiscalía que el fiscal anterior para la reasignación.' }
        });

        const result = await Caso.reasignar(1, 3); // Caso ID 1, Fiscal ID 3 (de otra fiscalía)
        expect(result.resultado).toBe(0);
        expect(result.mensaje).toContain('misma fiscalía');
    });
});
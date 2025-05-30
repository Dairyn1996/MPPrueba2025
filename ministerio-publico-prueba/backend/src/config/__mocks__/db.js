const sql = {
    Int: jest.fn(),
    NVarChar: jest.fn(),
    MAX: jest.fn(),
    Bit: jest.fn(),
    ConnectionPool: jest.fn(() => ({
        connect: jest.fn(() => Promise.resolve({
            request: jest.fn(() => ({
                input: jest.fn().mockReturnThis(),
                output: jest.fn().mockReturnThis(),
                execute: jest.fn(() => Promise.resolve({ recordset: [], output: {} }))
            }))
        }))
    }))
};

const poolPromise = Promise.resolve({}); // Mockear el poolPromise

module.exports = {
    sql,
    poolPromise
};
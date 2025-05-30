-- Crear la base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'MinisterioPublicoDB')
BEGIN
    CREATE DATABASE MinisterioPublicoDB;
END;
GO

USE MinisterioPublicoDB;
GO
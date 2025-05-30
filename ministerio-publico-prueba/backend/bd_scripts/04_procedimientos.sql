USE MinisterioPublicoDB;
GO

-- SP para Insertar Usuario
CREATE PROCEDURE sp_InsertarUsuario
    @NombreUsuario NVARCHAR(100),
    @ContrasenaHash NVARCHAR(255),
    @RolID INT,
    @UsuarioID INT OUTPUT
AS
BEGIN
    INSERT INTO Usuarios (NombreUsuario, ContrasenaHash, RolID)
    VALUES (@NombreUsuario, @ContrasenaHash, @RolID);
    SET @UsuarioID = SCOPE_IDENTITY();
END;
GO

-- SP para Obtener Usuario por Nombre de Usuario
CREATE PROCEDURE sp_ObtenerUsuarioPorNombre
    @NombreUsuario NVARCHAR(100)
AS
BEGIN
    SELECT u.UsuarioID, u.NombreUsuario, u.ContrasenaHash, u.RolID, r.NombreRol
    FROM Usuarios u
    INNER JOIN Roles r ON u.RolID = r.RolID
    WHERE u.NombreUsuario = @NombreUsuario AND u.Activo = 1;
END;
GO

-- SP para Insertar Caso
CREATE PROCEDURE sp_InsertarCaso
    @NumeroCaso NVARCHAR(50),
    @Titulo NVARCHAR(255),
    @Descripcion NVARCHAR(MAX),
    @EstadoID INT,
    @TipoDelitoID INT,
    @FiscalAsignadoID INT = NULL, -- Puede ser opcional
    @CasoID INT OUTPUT
AS
BEGIN
    INSERT INTO Casos (NumeroCaso, Titulo, Descripcion, EstadoID, TipoDelitoID, FiscalAsignadoID)
    VALUES (@NumeroCaso, @Titulo, @Descripcion, @EstadoID, @TipoDelitoID, @FiscalAsignadoID);
    SET @CasoID = SCOPE_IDENTITY();
END;
GO

-- SP para Actualizar Caso
CREATE PROCEDURE sp_ActualizarCaso
    @CasoID INT,
    @NumeroCaso NVARCHAR(50),
    @Titulo NVARCHAR(255),
    @Descripcion NVARCHAR(MAX),
    @EstadoID INT,
    @TipoDelitoID INT,
    @FiscalAsignadoID INT = NULL
AS
BEGIN
    UPDATE Casos
    SET
        NumeroCaso = @NumeroCaso,
        Titulo = @Titulo,
        Descripcion = @Descripcion,
        EstadoID = @EstadoID,
        TipoDelitoID = @TipoDelitoID,
        FiscalAsignadoID = @FiscalAsignadoID,
        FechaUltimaActualizacion = GETDATE()
    WHERE CasoID = @CasoID;
END;
GO

-- SP para Obtener Todos los Casos (con información relacionada)
CREATE PROCEDURE sp_ObtenerTodosCasos
AS
BEGIN
    SELECT
        c.CasoID,
        c.NumeroCaso,
        c.Titulo,
        c.Descripcion,
        c.FechaCreacion,
        c.FechaUltimaActualizacion,
        ec.NombreEstado AS Estado,
        td.NombreDelito AS TipoDelito,
        f.Nombre + ' ' + f.Apellido AS FiscalAsignado,
        f.FiscalID AS FiscalAsignadoID,
        fis.NombreFiscalia AS FiscaliaAsignada,
        fis.FiscaliaID AS FiscaliaAsignadaID,
        ec.EstadoID
    FROM Casos c
    INNER JOIN EstadosCaso ec ON c.EstadoID = ec.EstadoID
    INNER JOIN TiposDelito td ON c.TipoDelitoID = td.TipoDelitoID
    LEFT JOIN Fiscales f ON c.FiscalAsignadoID = f.FiscalID
    LEFT JOIN Fiscalias fis ON f.FiscaliaID = fis.FiscaliaID
    ORDER BY c.FechaCreacion DESC;
END;
GO

-- SP para Obtener Caso por ID
CREATE PROCEDURE sp_ObtenerCasoPorID
    @CasoID INT
AS
BEGIN
    SELECT
        c.CasoID,
        c.NumeroCaso,
        c.Titulo,
        c.Descripcion,
        c.FechaCreacion,
        c.FechaUltimaActualizacion,
        ec.NombreEstado AS Estado,
        td.NombreDelito AS TipoDelito,
        f.Nombre + ' ' + f.Apellido AS FiscalAsignado,
        f.FiscalID AS FiscalAsignadoID,
        fis.NombreFiscalia AS FiscaliaAsignada,
        ec.EstadoID,
        td.TipoDelitoID
    FROM Casos c
    INNER JOIN EstadosCaso ec ON c.EstadoID = ec.EstadoID
    INNER JOIN TiposDelito td ON c.TipoDelitoID = td.TipoDelitoID
    LEFT JOIN Fiscales f ON c.FiscalAsignadoID = f.FiscalID
    LEFT JOIN Fiscalias fis ON f.FiscaliaID = fis.FiscaliaID
    WHERE c.CasoID = @CasoID;
END;
GO

-- SP para Eliminar Caso
CREATE PROCEDURE sp_EliminarCaso
    @CasoID INT
AS
BEGIN
    DELETE FROM Casos WHERE CasoID = @CasoID;
END;
GO

-- SP para Reasignar Caso con Lógica de Negocio y Log
CREATE PROCEDURE sp_ReasignarCaso
    @CasoID INT,
    @NuevoFiscalID INT,
    @Resultado BIT OUTPUT, -- 1 para éxito, 0 para fallo
    @Mensaje NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @EstadoCasoActualID INT;
    DECLARE @NombreEstadoCasoActual NVARCHAR(50);
    DECLARE @FiscalActualID INT;
    DECLARE @FiscaliaActualID INT;
    DECLARE @NuevaFiscaliaID INT;

    SET @Resultado = 0; -- Por defecto, fallo
    SET @Mensaje = '';

    -- Obtener información del caso y del fiscal actual
    SELECT @EstadoCasoActualID = c.EstadoID,
           @FiscalActualID = c.FiscalAsignadoID
    FROM Casos c
    WHERE c.CasoID = @CasoID;

    SELECT @NombreEstadoCasoActual = NombreEstado
    FROM EstadosCaso
    WHERE EstadoID = @EstadoCasoActualID;

    -- Obtener fiscalía del fiscal actual (si está asignado)
    IF @FiscalActualID IS NOT NULL
    BEGIN
        SELECT @FiscaliaActualID = FiscaliaID
        FROM Fiscales
        WHERE FiscalID = @FiscalActualID;
    END;

    -- Obtener fiscalía del nuevo fiscal
    SELECT @NuevaFiscaliaID = FiscaliaID
    FROM Fiscales
    WHERE FiscalID = @NuevoFiscalID;

    -- Lógica de reasignación:
    -- 1. Un caso solo puede ser reasignado si el estado es 'Pendiente'.
    IF @NombreEstadoCasoActual <> 'Pendiente'
    BEGIN
        SET @Mensaje = 'El caso no puede ser reasignado porque su estado actual es "' + @NombreEstadoCasoActual + '". Solo se permiten reasignaciones para casos "Pendientes".';
        GOTO EndProcedure;
    END;

    -- 2. El nuevo fiscal debe pertenecer a la misma fiscalía que el fiscal anterior.
    IF @FiscalActualID IS NOT NULL AND @FiscaliaActualID <> @NuevaFiscaliaID
    BEGIN
        SET @Mensaje = 'El nuevo fiscal debe pertenecer a la misma fiscalía que el fiscal anterior para la reasignación.';
        GOTO EndProcedure;
    END;

    -- Si cumple las condiciones, proceder con la reasignación
    BEGIN TRY
        UPDATE Casos
        SET FiscalAsignadoID = @NuevoFiscalID,
            FechaUltimaActualizacion = GETDATE()
        WHERE CasoID = @CasoID;

        SET @Resultado = 1; -- Éxito
        SET @Mensaje = 'Caso reasignado con éxito.';

        -- Registrar log de éxito (aunque el requisito era para fallidos, es buena práctica)
        INSERT INTO LogsReasignacion (CasoID, FiscalAnteriorID, FiscalNuevoID, Exito, MensajeError)
        VALUES (@CasoID, @FiscalActualID, @NuevoFiscalID, 1, 'Reasignación exitosa.');

    END TRY
    BEGIN CATCH
        SET @Resultado = 0; -- Fallo
        SET @Mensaje = 'Error interno al reasignar el caso: ' + ERROR_MESSAGE();

        -- Registrar log de fallo
        INSERT INTO LogsReasignacion (CasoID, FiscalAnteriorID, FiscalNuevoID, Exito, MensajeError)
        VALUES (@CasoID, @FiscalActualID, @NuevoFiscalID, 0, @Mensaje);
    END CATCH;

EndProcedure:
    -- Si hubo un fallo por la lógica de negocio (no por error de BD), también loguear
    IF @Resultado = 0 AND @Mensaje <> '' AND NOT EXISTS (SELECT 1 FROM LogsReasignacion WHERE CasoID = @CasoID AND FiscalNuevoID = @NuevoFiscalID AND Exito = 0 AND MensajeError = @Mensaje)
    BEGIN
        INSERT INTO LogsReasignacion (CasoID, FiscalAnteriorID, FiscalNuevoID, Exito, MensajeError)
        VALUES (@CasoID, @FiscalActualID, @NuevoFiscalID, 0, @Mensaje);
    END;

END;
GO

-- SP para obtener fiscales y sus fiscalías
CREATE PROCEDURE sp_ObtenerFiscales
AS
BEGIN
    SELECT f.FiscalID, f.Nombre, f.Apellido, f.NumeroColegiado, fi.NombreFiscalia, fi.FiscaliaID
    FROM Fiscales f
    INNER JOIN Fiscalias fi ON f.FiscaliaID = fi.FiscaliaID;
END;
GO

-- SP para obtener los logs de reasignación (principalmente fallidos)
CREATE PROCEDURE sp_ObtenerLogsReasignacion
AS
BEGIN
    SELECT
        lr.LogID,
        lr.CasoID,
        c.NumeroCaso,
        fa.Nombre + ' ' + fa.Apellido AS FiscalAnterior,
        fn.Nombre + ' ' + fn.Apellido AS FiscalNuevo,
        lr.FechaReasignacion,
        lr.Exito,
        lr.MensajeError
    FROM LogsReasignacion lr
    INNER JOIN Casos c ON lr.CasoID = c.CasoID
    LEFT JOIN Fiscales fa ON lr.FiscalAnteriorID = fa.FiscalID
    INNER JOIN Fiscales fn ON lr.FiscalNuevoID = fn.FiscalID
    ORDER BY lr.FechaReasignacion DESC;
END;
GO

-- SPs para obtener listados de apoyo (selects para dropdowns en el frontend)
CREATE PROCEDURE sp_ObtenerTiposDelito
AS
BEGIN
    SELECT TipoDelitoID, NombreDelito FROM TiposDelito;
END;
GO

CREATE PROCEDURE sp_ObtenerEstadosCaso
AS
BEGIN
    SELECT EstadoID, NombreEstado FROM EstadosCaso;
END;
GO

CREATE PROCEDURE sp_ObtenerFiscalias
AS
BEGIN
    SELECT FiscaliaID, NombreFiscalia FROM Fiscalias;
END;
GO

-- SP para generación de informes (ej. casos por estado)
CREATE PROCEDURE sp_GenerarInformeCasosPorEstado
AS
BEGIN
    SELECT
        ec.NombreEstado AS Estado,
        COUNT(c.CasoID) AS TotalCasos
    FROM EstadosCaso ec
    LEFT JOIN Casos c ON ec.EstadoID = c.EstadoID
    GROUP BY ec.NombreEstado
    ORDER BY TotalCasos DESC;
END;
GO
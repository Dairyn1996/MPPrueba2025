USE MinisterioPublicoDB;
GO

-- Tabla de Roles (para control de acceso)
CREATE TABLE Roles (
    RolID INT PRIMARY KEY IDENTITY(1,1),
    NombreRol NVARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Usuarios
CREATE TABLE Usuarios (
    UsuarioID INT PRIMARY KEY IDENTITY(1,1),
    NombreUsuario NVARCHAR(100) NOT NULL UNIQUE,
    ContrasenaHash NVARCHAR(255) NOT NULL,
    RolID INT NOT NULL,
    Activo BIT DEFAULT 1,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (RolID) REFERENCES Roles(RolID)
);

-- Tabla de Fiscalias
CREATE TABLE Fiscalias (
    FiscaliaID INT PRIMARY KEY IDENTITY(1,1),
    NombreFiscalia NVARCHAR(255) NOT NULL UNIQUE,
    Direccion NVARCHAR(500)
);

-- Tabla de Fiscales
CREATE TABLE Fiscales (
    FiscalID INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NOT NULL,
    Apellido NVARCHAR(100) NOT NULL,
    NumeroColegiado NVARCHAR(50) UNIQUE,
    FiscaliaID INT NOT NULL,
    UsuarioID INT UNIQUE, -- Un fiscal puede tener un usuario asociado para login
    CONSTRAINT FK_Fiscales_Fiscalias FOREIGN KEY (FiscaliaID) REFERENCES Fiscalias(FiscaliaID),
    CONSTRAINT FK_Fiscales_Usuarios FOREIGN KEY (UsuarioID) REFERENCES Usuarios(UsuarioID)
);

-- Tabla de Tipos de Delito
CREATE TABLE TiposDelito (
    TipoDelitoID INT PRIMARY KEY IDENTITY(1,1),
    NombreDelito NVARCHAR(100) NOT NULL UNIQUE
);

-- Tabla de Estados de Caso
CREATE TABLE EstadosCaso (
    EstadoID INT PRIMARY KEY IDENTITY(1,1),
    NombreEstado NVARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de Casos
CREATE TABLE Casos (
    CasoID INT PRIMARY KEY IDENTITY(1,1),
    NumeroCaso NVARCHAR(50) NOT NULL UNIQUE, -- Podría ser un generador automático o manual
    Titulo NVARCHAR(255) NOT NULL,
    Descripcion NVARCHAR(MAX),
    EstadoID INT NOT NULL,
    TipoDelitoID INT NOT NULL,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    FechaUltimaActualizacion DATETIME DEFAULT GETDATE(),
    FiscalAsignadoID INT, -- Puede ser NULL inicialmente
    CONSTRAINT FK_Casos_EstadosCaso FOREIGN KEY (EstadoID) REFERENCES EstadosCaso(EstadoID),
    CONSTRAINT FK_Casos_TiposDelito FOREIGN KEY (TipoDelitoID) REFERENCES TiposDelito(TipoDelitoID),
    CONSTRAINT FK_Casos_Fiscales FOREIGN KEY (FiscalAsignadoID) REFERENCES Fiscales(FiscalID)
);

-- Tabla para logs de reasignación fallida
CREATE TABLE LogsReasignacion (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    CasoID INT NOT NULL,
    FiscalAnteriorID INT,
    FiscalNuevoID INT NOT NULL,
    FechaReasignacion DATETIME DEFAULT GETDATE(),
    Exito BIT, -- 0 para fallido, 1 para exitoso (aunque el requisito es para fallidos)
    MensajeError NVARCHAR(MAX),
    CONSTRAINT FK_LogsReasignacion_Casos FOREIGN KEY (CasoID) REFERENCES Casos(CasoID),
    CONSTRAINT FK_LogsReasignacion_FiscalAnterior FOREIGN KEY (FiscalAnteriorID) REFERENCES Fiscales(FiscalID),
    CONSTRAINT FK_LogsReasignacion_FiscalNuevo FOREIGN KEY (FiscalNuevoID) REFERENCES Fiscales(FiscalID)
);
GO


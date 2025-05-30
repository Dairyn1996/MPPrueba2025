USE MinisterioPublicoDB;
GO

-- Insertar Roles
INSERT INTO Roles (NombreRol) VALUES ('Administrador');
INSERT INTO Roles (NombreRol) VALUES ('Fiscal');
INSERT INTO Roles (NombreRol) VALUES ('Investigador');

-- Insertar Estados de Caso
INSERT INTO EstadosCaso (NombreEstado) VALUES ('Pendiente');
INSERT INTO EstadosCaso (NombreEstado) VALUES ('En Proceso');
INSERT INTO EstadosCaso (NombreEstado) VALUES ('Cerrado');
INSERT INTO EstadosCaso (NombreEstado) VALUES ('Archivado');

-- Insertar Tipos de Delito
INSERT INTO TiposDelito (NombreDelito) VALUES ('Robo');
INSERT INTO TiposDelito (NombreDelito) VALUES ('Homicidio');
INSERT INTO TiposDelito (NombreDelito) VALUES ('Fraude');
INSERT INTO TiposDelito (NombreDelito) VALUES ('Extorsión');

-- Insertar Fiscalias
INSERT INTO Fiscalias (NombreFiscalia, Direccion) VALUES ('Fiscalía Central', '1ra Calle 1-23 Zona 1');
INSERT INTO Fiscalias (NombreFiscalia, Direccion) VALUES ('Fiscalía de Quetzaltenango', 'Avenida La Independencia');

-- Insertar un usuario administrador (la contraseña se hasheará en el backend)
INSERT INTO Usuarios (NombreUsuario, ContrasenaHash, RolID) VALUES ('admin', '$2a$10$abcdefghijklmnopqrstuvwxyzabcdefghijklmnop', (SELECT RolID FROM Roles WHERE NombreRol = 'Administrador'));
INSERT INTO Usuarios (NombreUsuario, ContrasenaHash, RolID) VALUES ('juan.perez', '$2a$10$abcdefghijklmnopqrstuvwxyzabcdefghijklmnop', (SELECT RolID FROM Roles WHERE NombreRol = 'Fiscal'));
INSERT INTO Usuarios (NombreUsuario, ContrasenaHash, RolID) VALUES ('maria.gomez', '$2a$10$abcdefghijklmnopqrstuvwxyzabcdefghijklmnop', (SELECT RolID FROM Roles WHERE NombreRol = 'Fiscal'));

-- Insertar Fiscales
INSERT INTO Fiscales (Nombre, Apellido, NumeroColegiado, FiscaliaID, UsuarioID)
VALUES ('Juan', 'Pérez', 'C12345', (SELECT FiscaliaID FROM Fiscalias WHERE NombreFiscalia = 'Fiscalía Central'), (SELECT UsuarioID FROM Usuarios WHERE NombreUsuario = 'juan.perez'));

INSERT INTO Fiscales (Nombre, Apellido, NumeroColegiado, FiscaliaID, UsuarioID)
VALUES ('María', 'Gómez', 'C67890', (SELECT FiscaliaID FROM Fiscalias WHERE NombreFiscalia = 'Fiscalía de Quetzaltenango'), (SELECT UsuarioID FROM Usuarios WHERE NombreUsuario = 'maria.gomez'));

-- Insertar Casos (para probar)
INSERT INTO Casos (NumeroCaso, Titulo, Descripcion, EstadoID, TipoDelitoID, FiscalAsignadoID)
VALUES ('MP-2025-001', 'Robo a mano armada en Zona 10', 'Denuncia de robo en tienda de conveniencia.',
        (SELECT EstadoID FROM EstadosCaso WHERE NombreEstado = 'Pendiente'),
        (SELECT TipoDelitoID FROM TiposDelito WHERE NombreDelito = 'Robo'),
        (SELECT FiscalID FROM Fiscales WHERE Nombre = 'Juan'));

INSERT INTO Casos (NumeroCaso, Titulo, Descripcion, EstadoID, TipoDelitoID, FiscalAsignadoID)
VALUES ('MP-2025-002', 'Homicidio en la Zona 3', 'Hallazgo de cuerpo sin vida.',
        (SELECT EstadoID FROM EstadosCaso WHERE NombreEstado = 'En Proceso'),
        (SELECT TipoDelitoID FROM TiposDelito WHERE NombreDelito = 'Homicidio'),
        (SELECT FiscalID FROM Fiscales WHERE Nombre = 'Juan'));

INSERT INTO Casos (NumeroCaso, Titulo, Descripcion, EstadoID, TipoDelitoID) -- Caso sin asignar y pendiente
VALUES ('MP-2025-003', 'Fraude electrónico', 'Estafa a través de internet.',
        (SELECT EstadoID FROM EstadosCaso WHERE NombreEstado = 'Pendiente'),
        (SELECT TipoDelitoID FROM TiposDelito WHERE NombreDelito = 'Fraude'));
GO
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarioModel');
require('dotenv').config();

// @route   POST /api/auth/register
// @desc    Registrar un nuevo usuario (solo para administradores o setup inicial)
// @access  Public (para el primer admin), luego Private (Admin)
router.post('/register', async (req, res) => {
    const { nombreUsuario, contrasena, rolId } = req.body;

    try {
        // Verificar si el usuario ya existe
        let usuario = await Usuario.obtenerPorNombre(nombreUsuario);
        if (usuario) {
            return res.status(400).json({ msg: 'El usuario ya existe' });
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash(contrasena, salt);

        // Crear usuario
        const usuarioId = await Usuario.crear(nombreUsuario, contrasenaHash, rolId);

        // Generar JWT (opcional al registrar, pero útil si se auto-loguea)
        const payload = {
            user: {
                id: usuarioId,
                nombreUsuario: nombreUsuario,
                rolId: rolId // Asegúrate de que el modelo devuelva el rol
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ msg: 'Usuario registrado con éxito', token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST /api/auth/login
// @desc    Autenticar usuario y obtener token
// @access  Public
router.post('/login', async (req, res) => {
    const { nombreUsuario, contrasena } = req.body;

    try {
        // 1. Verificar existencia del usuario
        const user = await Usuario.obtenerPorNombre(nombreUsuario);
        if (!user) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        // 2. Comparar contraseña
        const isMatch = await bcrypt.compare(contrasena, user.ContrasenaHash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas' });
        }

        // 3. Generar y devolver JWT
        const payload = {
            user: {
                id: user.UsuarioID,
                nombreUsuario: user.NombreUsuario,
                rolId: user.RolID,
                rolNombre: user.NombreRol // Asegúrate de que el SP y modelo devuelvan este campo
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token expira en 1 hora
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { nombreUsuario: user.NombreUsuario, rol: user.NombreRol } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
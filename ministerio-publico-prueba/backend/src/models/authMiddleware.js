const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
    const token = req.header('x-auth-token'); // O 'Authorization' con 'Bearer '

    if (!token) {
        return res.status(401).json({ msg: 'No token, autorización denegada' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Adjunta el payload del token al objeto request
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token no válido' });
    }
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.rolNombre) {
            return res.status(403).json({ msg: 'Acceso denegado: Rol de usuario no definido.' });
        }
        if (!roles.includes(req.user.rolNombre)) {
            return res.status(403).json({ msg: 'Acceso denegado: No tienes los permisos necesarios.' });
        }
        next();
    };
};

module.exports = { auth, authorize };
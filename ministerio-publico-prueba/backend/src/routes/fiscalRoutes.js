const express = require('express');
const router = express.Router();
const Fiscal = require('../models/fiscalModel');
const { auth, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/fiscales
// @desc    Obtener todos los fiscales
// @access  Private (Todos los usuarios autenticados)
router.get('/', auth, async (req, res) => {
    try {
        const fiscales = await Fiscal.obtenerTodos();
        res.json(fiscales);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
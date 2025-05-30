const express = require('express');
const router = express.Router();
const Util = require('../models/utilModel');
const { auth } = require('../middleware/authMiddleware'); // Solo auth es suficiente para estos listados

// @route   GET /api/utils/tipos-delito
// @desc    Obtener tipos de delito
// @access  Private (Todos los usuarios autenticados)
router.get('/tipos-delito', auth, async (req, res) => {
    try {
        const tipos = await Util.obtenerTiposDelito();
        res.json(tipos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET /api/utils/estados-caso
// @desc    Obtener estados de caso
// @access  Private (Todos los usuarios autenticados)
router.get('/estados-caso', auth, async (req, res) => {
    try {
        const estados = await Util.obtenerEstadosCaso();
        res.json(estados);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET /api/utils/fiscalias
// @desc    Obtener fiscalías
// @access  Private (Todos los usuarios autenticados)
router.get('/fiscalias', auth, async (req, res) => {
    try {
        const fiscalias = await Util.obtenerFiscalias();
        res.json(fiscalias);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET /api/utils/logs-reasignacion
// @desc    Obtener logs de reasignación (solo para administradores, por ejemplo)
// @access  Private (Solo Administrador)
const { authorize } = require('../middleware/authMiddleware'); // Importar authorize para este endpoint
router.get('/logs-reasignacion', auth, authorize(['Administrador']), async (req, res) => {
    try {
        const logs = await Util.obtenerLogsReasignacion();
        res.json(logs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Caso = require('../models/casoModel');
const { auth, authorize } = require('../middleware/authMiddleware');

// @route   GET /api/casos
// @desc    Obtener todos los casos
// @access  Private (Todos los usuarios autenticados)
router.get('/', auth, async (req, res) => {
    try {
        const casos = await Caso.obtenerTodos();
        res.json(casos);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET /api/casos/:id
// @desc    Obtener un caso por ID
// @access  Private (Todos los usuarios autenticados)
router.get('/:id', auth, async (req, res) => {
    try {
        const caso = await Caso.obtenerPorId(req.params.id);
        if (!caso) {
            return res.status(404).json({ msg: 'Caso no encontrado' });
        }
        res.json(caso);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   POST /api/casos
// @desc    Crear un nuevo caso
// @access  Private (Solo Administrador o Fiscal)
router.post('/', auth, authorize(['Administrador', 'Fiscal']), async (req, res) => {
    const { numeroCaso, titulo, descripcion, estadoId, tipoDelitoId, fiscalAsignadoId } = req.body;

    try {
        const casoId = await Caso.crear(numeroCaso, titulo, descripcion, estadoId, tipoDelitoId, fiscalAsignadoId);
        res.status(201).json({ msg: 'Caso creado con éxito', casoId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   PUT /api/casos/:id
// @desc    Actualizar un caso
// @access  Private (Solo Administrador o Fiscal)
router.put('/:id', auth, authorize(['Administrador', 'Fiscal']), async (req, res) => {
    const { numeroCaso, titulo, descripcion, estadoId, tipoDelitoId, fiscalAsignadoId } = req.body;
    const { id } = req.params;

    try {
        const success = await Caso.actualizar(id, numeroCaso, titulo, descripcion, estadoId, tipoDelitoId, fiscalAsignadoId);
        if (!success) {
            return res.status(404).json({ msg: 'Caso no encontrado' });
        }
        res.json({ msg: 'Caso actualizado con éxito' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   PUT /api/casos/:id/reasignar
// @desc    Reasignar un caso a otro fiscal con validaciones
// @access  Private (Solo Administrador o Fiscal)
router.put('/:id/reasignar', auth, authorize(['Administrador', 'Fiscal']), async (req, res) => {
    const { nuevoFiscalId } = req.body;
    const { id: casoId } = req.params;

    try {
        const result = await Caso.reasignar(casoId, nuevoFiscalId);

        if (result.resultado === 1) { // Éxito
            res.json({ msg: result.mensaje });
        } else { // Fallo debido a la lógica de negocio (ya logueado en SP)
            res.status(400).json({ msg: result.mensaje });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});


// @route   DELETE /api/casos/:id
// @desc    Eliminar un caso
// @access  Private (Solo Administrador)
router.delete('/:id', auth, authorize(['Administrador']), async (req, res) => {
    try {
        const success = await Caso.eliminar(req.params.id);
        if (!success) {
            return res.status(404).json({ msg: 'Caso no encontrado' });
        }
        res.json({ msg: 'Caso eliminado con éxito' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
const { Router } = require('express');
const { check, body } = require('express-validator');
const { getReporteSAR } = require('../../controllers/facturacion/reporteria/sar.report.controller');
const { getAllSAR, getSAR, postSAR } = require('../../controllers/facturacion/sar.controllers');
const { validarCampos } = require('../../middlewares');
const { validarEspaciosCAI } = require('../../middlewares/validaciones-cai');
const { existeCAI } = require('../../middlewares/validar-cai-existente');

const router = Router();

router.get('/', getAllSAR);

router.get('/:id', getSAR);

router.post('/', [
    // Validaciones del CAI
    validarEspaciosCAI,
    check('cai', 'El cai es obligatorio').not().isEmpty(),
    check('cai', 'CAI debe estar en mayúscula').isUppercase(),
    check('cai', 'Máximo de caracteres: 37').isLength({ max: 37 }),
    existeCAI,
    // Validaciones del rango mínimo
    check('rango_minimo', 'El rango mínimo es obligatorio').not().isEmpty(),
    check('rango_minimo', 'Solo se permiten números en el rango mínimo').not().isNumeric(),
    check('rango_minimo', 'Máximo de caracteres: 19').isLength({ max: 19 }),
    // Validaciones del rango mínimo
    check('rango_maximo', 'El rango máximo es obligatorio').not().isEmpty(),
    check('rango_maximo', 'Solo se permiten números en el rango máximo').not().isNumeric(),
    check('rango_maximo', 'Máximo de caracteres: 19').isLength({ max: 19 }),
    // Validación de fechas
    check('fecha_autorizado', 'La fecha autorizada es obligatoria').not().isEmpty(),
    check('fecha_limite_emision', 'La fecha límite de emisión es obligatoria').not().isEmpty(),
    validarCampos
], postSAR);

router.post('/reporteria/cai', getReporteSAR);

module.exports = router;
const { Router } = require('express');
const { check, body } = require('express-validator');
const { getAllSAR, getSAR, postSAR, putSAR, deleteSAR } = require('../../controllers/facturacion/sar.controllers');
const { validarCampos } = require('../../middlewares');
const { validarEspaciosCAI } = require('../../middlewares/validaciones-cai');
const { existeCAI, existeRangoMinimo, existeRangoMaximo, noExisteCAIPorId, existeCaiPut } = require('../../middlewares/validar-cai-existente');

const router = Router();

router.get('/', getAllSAR);

router.get('/:id', getSAR);

router.post('/', [
    // Validar usuario quien lo creo
    check('id_usuario', 'El id es obligatorio').not().isEmpty(),
    // Validaciones del CAI
    validarEspaciosCAI,
    check('cai', 'El cai es obligatorio').not().isEmpty(),
    check('cai', 'CAI debe estar en mayúscula').isUppercase(),
    check('cai', 'Máximo de caracteres en el CAI: 37').isLength({ max: 37 }),
    existeCAI,
    // Validaciones del rango mínimo
    check('rango_minimo', 'El rango mínimo es obligatorio').not().isEmpty(),
    check('rango_minimo', 'Solo se permiten números en el rango mínimo').not().isNumeric(),
    check('rango_minimo', 'Máximo de caracteres del rango mímino: 19').isLength({ max: 19 }),
    existeRangoMinimo,
    // Validaciones del rango mínimo
    check('rango_maximo', 'El rango máximo es obligatorio').not().isEmpty(),
    check('rango_maximo', 'Solo se permiten números en el rango máximo').not().isNumeric(),
    check('rango_maximo', 'Máximo de caracteres del rango máximo: 19').isLength({ max: 19 }),
    existeRangoMaximo,
    // Validación de fechas
    check('fecha_autorizado', 'La fecha autorizada es obligatoria').not().isEmpty(),
    check('fecha_limite_emision', 'La fecha límite de emisión es obligatoria').not().isEmpty(),
    validarCampos
], postSAR);

router.put('/:id', [
    // Validar usuario quien lo creo
    check('id_usuario', 'El id es obligatorio').not().isEmpty(),
    // Validaciones del CAI
    validarEspaciosCAI,
    check('cai', 'CAI debe estar en mayúscula').isUppercase(),
    check('cai', 'Máximo de caracteres en el CAI: 37').isLength({ max: 37 }),
    noExisteCAIPorId,
    // Validaciones del rango mínimo
    check('rango_minimo', 'Solo se permiten números en el rango mínimo').not().isNumeric(),
    check('rango_minimo', 'Máximo de caracteres del rango mímino: 19').isLength({ max: 19 }),
    existeRangoMinimo,
    // Validaciones del rango mínimo
    check('rango_maximo', 'Solo se permiten números en el rango máximo').not().isNumeric(),
    check('rango_maximo', 'Máximo de caracteres del rango máximo: 19').isLength({ max: 19 }),
    existeRangoMaximo,
    // Validaciones del número actual
    check('numero_actual', 'Solo se permiten números en el número actual').not().isNumeric(),
    check('numero_actual', 'Máximo de caracteres del número actual: 19').isLength({ max: 19 }),
    existeCaiPut,
    validarCampos
], putSAR);

router.delete('/:id', [
    // Validar existencia
    check('quienElimina', 'El id del usuario es obligatorio').not().isEmpty(),
    noExisteCAIPorId,
    validarCampos
], deleteSAR);

module.exports = router;
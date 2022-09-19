const { Router } = require('express');
const { check } = require('express-validator');
const { getParametros, getParametro, putParametro } = require('../../controllers/seguridad/parametros.controllers');
const { validarCamposYExistenciaParametros } = require('../../middlewares/validaciones-parametro');
const { validarCampos } = require('../../middlewares/validar-campos');

const router = Router();

router.get('/', getParametros);

router.get('/:id_parametro', getParametro);

router.put('/:id_parametro', [
    // Validar que venga el campo
    check('valor', 'El valor del parametro es obligatorio').not().isEmpty(),
    validarCampos,
    // Validaciones personalizadas
    validarCamposYExistenciaParametros
], putParametro);

module.exports = router;
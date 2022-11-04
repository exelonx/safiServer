const { Router } = require('express');
const { check } = require('express-validator');
const { getCatalogo } = require('../../controllers/catalogo_ventas/catalogo.controllers');
const { validarCampos } = require('../../middlewares');


const router = Router();

router.get('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('nombre', 'Nombre solo recibe texto').isAlpha('es-ES', {ignore: '1234'}),
    validarCampos
], getCatalogo);

module.exports = router
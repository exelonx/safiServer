const { Router } = require('express');
const { check } = require('express-validator');
const { getProductos } = require('../../controllers/catalogo_ventas/producto.controllers');
const { validarCampos } = require('../../middlewares');


const router = Router();

router.get('/', getProductos);

module.exports = router
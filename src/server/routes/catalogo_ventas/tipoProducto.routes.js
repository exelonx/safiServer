const { Router } = require('express');
const { getTipoProducto } = require('../../controllers/catalogo_ventas/tipoProducto.controllers');

const router = Router();

router.get('/', getTipoProducto);

module.exports = router
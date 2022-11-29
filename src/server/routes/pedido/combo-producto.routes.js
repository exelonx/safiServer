const { Router } = require('express');
const { check, body } = require('express-validator');
const { getComboProductos, getComboProducto } = require('../../controllers/pedido/combo-producto.controller');
const { getReporteDescuento } = require('../../controllers/pedido/reporteria/descuento.report.controller');

const router = Router();

router.get('/', getComboProductos);

router.get('/:id', getComboProducto);

module.exports = router;
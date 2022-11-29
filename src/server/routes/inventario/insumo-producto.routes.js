const { Router } = require('express');
const { check, body } = require('express-validator');
const { getInsumoProducto, getInsumoProductos } = require('../../controllers/inventario/insumo-producto.controllers');
const { getReporteDescuento } = require('../../controllers/pedido/reporteria/descuento.report.controller');

const router = Router();

router.get('/', getInsumoProductos);

router.get('/:id', getInsumoProducto);

module.exports = router;
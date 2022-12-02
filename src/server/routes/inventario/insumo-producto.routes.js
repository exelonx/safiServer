const { Router } = require('express');
const { check, body } = require('express-validator');
const { getInsumoProducto, getInsumoProductos, getInsumosProducto } = require('../../controllers/inventario/insumo-producto.controllers');
const { getReporteDescuento } = require('../../controllers/pedido/reporteria/descuento.report.controller');

const router = Router();

router.get('/', getInsumoProductos);

router.get('/:id', getInsumoProducto);

router.get('/insumos/:id_producto', getInsumosProducto)

module.exports = router;
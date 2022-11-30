const { Router } = require('express');
const { check, body } = require('express-validator');
const { getPromocionProducto, getPromocionProductos } = require('../../controllers/pedido/promocion-producto');
const { getReporteDescuento } = require('../../controllers/pedido/reporteria/descuento.report.controller');

const router = Router();

router.get('/', getPromocionProductos);

router.get('/:id_promocion', getPromocionProducto);

module.exports = router;
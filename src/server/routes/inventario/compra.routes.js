const { Router } = require('express');
const { check, body } = require('express-validator');
const { getCompras, postCompra, getCompra, putAddInsumoCompraExistente, putMasInsumosEnDetalle, deleteUnDetalle, putNombreProveedor, anularCompra } = require('../../controllers/inventario/compra.controllers');
const { getReporteCompraInsumos } = require('../../controllers/inventario/reporteria/compra.report.controller');
const { getReporteDetalleCompra } = require('../../controllers/inventario/reporteria/detalle_compra.report.controller');


const router = Router();

router.get('/', getCompras);

router.get('/:id_compra', getCompra)

router.post('/ingreso/insumos', postCompra)

router.put('/editar/detalle/:id_detalle', putAddInsumoCompraExistente)

router.post('/editar/ingreso/:id_compra', putMasInsumosEnDetalle);

router.delete('/editar/detalle/:id_detalle', deleteUnDetalle)

router.put('/editar/proveedor/:id_compra', putNombreProveedor);

router.put('/anular/:id_compra', anularCompra);

router.post('/reporteria/compraInsumo', getReporteCompraInsumos);

router.post('/reporteria/detalle-compra', getReporteDetalleCompra);

module.exports = router;
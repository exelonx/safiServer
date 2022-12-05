const { Router } = require('express');
const { check, body } = require('express-validator');
const { getInformaciónFactura, validarPedido, facturar, imprimirFacturaPedido, getFacturas } = require('../../controllers/facturacion/facturacion.controllers');
const { postMesaPedido, validarCaja, getMesas, getPedidosPorMesa, getDetalleDelPedido, getProductosParaAgregar, getBebidas, getMesa, postDetalle, putEstadoDetalle, deleteUnDetalle, deletePedido, getUnDetalleDelPedido, putDetalle } = require('../../controllers/pedido/mesa.controllers');
const { validarEspacio, validarCampos, validarDobleEspacio } = require('../../middlewares');

const router = Router();

router.get('/facturas/', getFacturas)

router.get('/', getInformaciónFactura)

router.get('/pedido/:id_pedido', validarPedido)

router.post('/facturar/:id_pedido', facturar)

router.post('/facturar/factura/:id_pedido', imprimirFacturaPedido)

module.exports = router;
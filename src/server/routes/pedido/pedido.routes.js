const { Router } = require('express');
const { check, body } = require('express-validator');
const { getInsumos, getInsumo, postInsumo, deleteInsumo, putInsumo } = require('../../controllers/inventario/insumo.controllers');
const { getReportePedido } = require('../../controllers/pedido/reporteria/pedido.report.controller');

const { validarCampos, validarEspacio, validarDobleEspacio } = require('../../middlewares');
const { validarEspaciosProveedor } = require('../../middlewares/validaciones-proveedores');
const { existeProveedor, noExisteProveedorPorId } = require('../../middlewares/validar-proveedor-existente');

const router = Router();

router.get('/', getInsumos);

router.post('/reporteria/pedido', getReportePedido);

module.exports = router;
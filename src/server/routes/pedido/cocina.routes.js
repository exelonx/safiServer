const { Router } = require('express');
const { check, body } = require('express-validator');
const { getDetallesCocina, getDetallesVistaCliente } = require('../../controllers/pedido/cocina.controllers');
const { getReporteCocina } = require('../../controllers/pedido/reporteria/cocina.report.controller');

const { validarCampos } = require('../../middlewares');

const router = Router();

router.get('/', getDetallesCocina);

router.get('/vista-clientes/', getDetallesVistaCliente);

router.post('/reporteria/cocina', getReporteCocina);


module.exports = router;
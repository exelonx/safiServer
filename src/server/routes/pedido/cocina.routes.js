const { Router } = require('express');
const { check, body } = require('express-validator');
const { getDetallesCocina } = require('../../controllers/pedido/cocina.controllers');

const { validarCampos } = require('../../middlewares');

const router = Router();

router.get('/', getDetallesCocina);

// router.post('/reporteria/cocina', getReporteCocina);


module.exports = router;
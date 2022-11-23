const { Router } = require('express');
const { check, body } = require('express-validator');
const { postMesaPedido, validarCaja } = require('../../controllers/pedido/mesa.controllers');

const router = Router();

router.post('/', postMesaPedido);

router.get('/validarCaja', validarCaja)

module.exports = router;
const { Router } = require('express');
const { getTipoPagos, getTipoPago } = require('../../controllers/facturacion/tipo_pago.controllers');

const router = Router();

router.get('/', getTipoPagos);

router.get('/:id', getTipoPago);

module.exports = router;
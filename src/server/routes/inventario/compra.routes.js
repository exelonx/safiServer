const { Router } = require('express');
const { check, body } = require('express-validator');
const { getCompras } = require('../../controllers/inventario/compra.controllers');


const router = Router();

router.get('/', getCompras);

module.exports = router;
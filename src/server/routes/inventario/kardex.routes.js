const { Router } = require('express');
const { check, body } = require('express-validator');
const { getKardex } = require('../../controllers/inventario/kardex.controllers');

const router = Router();

router.get('/', getKardex);

module.exports = router;
const { Router } = require('express');
const { getInventarios } = require('../../controllers/inventario/inventario.controllers');


const router = Router();

router.get('/', getInventarios);

module.exports = router;
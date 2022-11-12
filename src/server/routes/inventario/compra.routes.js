const { Router } = require('express');
const { check, body } = require('express-validator');
const { getInsumos, getInsumo, postInsumo, deleteInsumo } = require('../../controllers/inventario/insumo.controllers');


const router = Router();

router.get('/', getInsumos);

module.exports = router;
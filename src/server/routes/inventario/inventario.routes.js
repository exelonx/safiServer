const { Router } = require('express');
const { getInsumos, getInsumo, postInsumo, deleteInsumo, putInsumo } = require('../../controllers/inventario/insumo.controllers');


const router = Router();

router.get('/', getInsumos);

module.exports = router;
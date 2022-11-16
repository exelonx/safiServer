const { Router } = require('express');
const { check, body } = require('express-validator');
const { getCompras, postCompra, getCompra } = require('../../controllers/inventario/compra.controllers');


const router = Router();

router.get('/', getCompras);

router.get('/:id_compra', getCompra)

router.post('/ingreso/insumos', postCompra)

module.exports = router;
const { Router } = require('express');
const { check, body } = require('express-validator');
const { getCompras, postCompra, getCompra, putAddInsumoCompraExistente, putMasInsumosEnDetalle, deleteUnDetalle } = require('../../controllers/inventario/compra.controllers');


const router = Router();

router.get('/', getCompras);

router.get('/:id_compra', getCompra)

router.post('/ingreso/insumos', postCompra)

router.put('/editar/detalle/:id_detalle', putAddInsumoCompraExistente)

router.post('/editar/ingreso/:id_compra', putMasInsumosEnDetalle);

router.delete('/editar/detalle/:id_detalle', deleteUnDetalle)

module.exports = router;
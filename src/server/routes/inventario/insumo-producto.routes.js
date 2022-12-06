const { Router } = require('express');
const { getInsumoProducto, getInsumoProductos, getInsumosProducto } = require('../../controllers/inventario/insumo-producto.controllers');

const router = Router();

router.get('/', getInsumoProductos);

router.get('/:id', getInsumoProducto);

router.get('/insumos/:id_producto', getInsumosProducto)

module.exports = router;
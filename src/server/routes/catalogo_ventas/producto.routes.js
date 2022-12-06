const { Router } = require('express');
const { check } = require('express-validator');
const { getProductos, getProducto, postProducto, deleteProducto, putProducto, postCombo, postPromocion, getCatalogoProducto, getComboProducto, getPromoProducto, putInfoProducto, putInsumoProducto, putCatalogoProducto, putMasCatalogoProducto, putMasInsumoProducto, deleteUnInsumo, deleteUnaCategoria, putComboProducto, putMasComboProducto, deleteComboProducto, putPromocionProducto, putMasPromocionProducto, deletePromoProducto } = require('../../controllers/catalogo_ventas/producto.controllers');
const { getReporteCombo } = require('../../controllers/catalogo_ventas/reporteria/combo.report.controller');
const { getReporteProducto } = require('../../controllers/catalogo_ventas/reporteria/producto.report.controller');
const { getReportePromocion } = require('../../controllers/catalogo_ventas/reporteria/promocion.report.controller');
const { validarCampos } = require('../../middlewares');
const { noExisteProductoPorId } = require('../../middlewares/validar-producto-existente');


const router = Router();

router.get('/', getProductos);

router.get('/:id', getProducto);

router.post('/', postProducto);
router.post('/combo/', postCombo);
router.post('/promocion', postPromocion);

router.delete('/:id',[
    check('quienElimina', 'El id es obligatorio').not().isEmpty(),
    noExisteProductoPorId,
    validarCampos
],deleteProducto);

// Reportería
router.post('/reporteria/producto', getReporteProducto);
router.post('/reporteria/combo', getReporteCombo);
router.post('/reporteria/promocion', getReportePromocion);

// Catalogo-producto
router.get('/catalogo/:id_producto', getCatalogoProducto)
// Combo-producto
router.get('/combo/:id_producto', getComboProducto)
// Promocion-producto
router.get('/promo/:id_producto', getPromoProducto)

// PUT PRODUCTOS
router.put('/:id_producto', putInfoProducto)
router.put('/insumo-producto/:id_insumoDetalle', putInsumoProducto)

// PUT COMBOS
router.put('/combo-producto/:id_comboDetalle', putComboProducto)
router.post('/combo-producto/add/:id_producto', putMasComboProducto)
router.put('/combo-producto/delete/:idComboProducto', deleteComboProducto)

// PUT PROMOS
router.put('/promo-producto/:id_promoDetalle', putPromocionProducto)
router.post('/promo-producto/add/:id_producto', putMasPromocionProducto)
router.put('/promo-producto/delete/:idPromoProducto', deletePromoProducto)

// PUT CATEGORIA-PRODUCTO
router.post('/categoria-producto/add/:id_producto', putMasCatalogoProducto)
router.post('/insumo-producto/add/:id_producto', putMasInsumoProducto)

// DELETE INSUMO-PRODUCTO
router.put('/insumo-producto/delete/:idInsumoProducto', deleteUnInsumo)

// DELETE CATEGORIA-PRODUCTO
router.put('/categoria-producto/delete/:idCategoriaProducto', deleteUnaCategoria)

module.exports = router
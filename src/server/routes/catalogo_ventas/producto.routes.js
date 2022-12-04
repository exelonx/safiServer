const { Router } = require('express');
const { check, body } = require('express-validator');
const { getProductos, getProducto, postProducto, deleteProducto, putProducto, postCombo, postPromocion, getCatalogoProducto, getComboProducto, getPromoProducto, putInfoProducto, putInsumoProducto, putCatalogoProducto, putMasCatalogoProducto, putMasInsumoProducto, deleteUnInsumo, deleteUnaCategoria, putComboProducto, putMasComboProducto, deleteComboProducto, putPromocionProducto, putMasPromocionProducto, deletePromoProducto } = require('../../controllers/catalogo_ventas/producto.controllers');
const { getReporteCombo } = require('../../controllers/catalogo_ventas/reporteria/combo.report.controller');
const { getReporteProducto } = require('../../controllers/catalogo_ventas/reporteria/producto.report.controller');
const { getReportePromocion } = require('../../controllers/catalogo_ventas/reporteria/promocion.report.controller');
const { validarCampos } = require('../../middlewares');
const { existeProducto, noExisteProductoPorId } = require('../../middlewares/validar-producto-existente');


const router = Router();

router.get('/', getProductos);

router.get('/:id', getProducto);

router.post('/', postProducto);
router.post('/combo/', postCombo);
router.post('/promocion', postPromocion);

// router.post('/',[
//     check('id_usuario', 'El id es obligatorio.').not().isEmpty(),
//     check('id_impuesto', 'El impuesto es obligatorio.').not().isEmpty(),
//     check('id_tipo_producto', 'El tipo de producto es obligatorio.').not().isEmpty(),
//     check('nombre', 'El nombre es obligatorio.').not().isEmpty(),
//     check('nombre', 'Solo se permite texto').isAlpha('es-ES', {ignore: ' '}),
//     check('nombre', 'Nombre debe estar en mayúscula').isUppercase(),
//     check('nombre', 'Máximo de caracteres: 100').isLength({ max: 100 }),
//     existeProducto,
//     check('precio', 'El precio es obligatorio.').not().isEmpty(),
//     check('precio', 'Solo se permiten números.').isDecimal(),
//     check('exenta', 'El exenta es obligatorio.').not().isEmpty(),
//     check('descripcion', 'La descripcion es obligatoria.').not().isEmpty(),
//     check('descripcion', 'Solo se permite texto').isAlpha('es-ES', {ignore: ' '}),
//     check('descripcion', 'Nombre debe estar en mayúscula').isUppercase(),
//     check('descripcion', 'Máximo de caracteres: 100').isLength({ max: 100 }),
//     check('sin_estado', 'El estado es obligatorio.').not().isEmpty(),
//     check('bebida', 'La bebida es obligatoria.').not().isEmpty(),
//     validarCampos
// ], postProducto);

// router.put('/actualizarProducto/:id',[
//     check('id_usuario', 'El id es obligatorio.').not().isEmpty(),
//     check('id_impuesto', 'El impuesto es obligatorio.').not().isEmpty(),
//     check('id_tipo_producto', 'El tipo de producto es obligatorio.').not().isEmpty(),
//     check('nombre', 'El nombre es obligatorio.').not().isEmpty(),
//     check('nombre', 'El nombre del producto deben ser solo letras').if(body('nombre').exists()).if(body('nombre').not().equals('')).isAlpha('es-ES', {ignore: ' '}),
//     check('nombre', 'Nombre debe estar en mayúscula').isUppercase(),
//     check('nombre', 'Máximo de caracteres: 100').isLength({ max: 100 }),
//     noExisteProductoPorId,
//     check('precio', 'El precio es obligatorio.').not().isEmpty(),
//     check('precio', 'Solo se permiten números.').isDecimal(),
//     check('exenta', 'El exenta es obligatorio.').not().isEmpty(),
//     check('descripcion', 'La descripcion es obligatoria.').not().isEmpty(),
//     check('descripcion', 'La descripción del producto deben ser solo letras').if(body('descripcion').exists()).if(body('descripcion').not().equals('')).isAlpha('es-ES', {ignore: ' '}),
//     check('descripcion', 'La descripción debe estar en mayúscula').isUppercase(),
//     check('descripcion', 'Máximo de caracteres: 100').isLength({ max: 100 }),
//     check('sin_estado', 'El estado es obligatorio.').not().isEmpty(),
//     check('bebida', 'La bebida es obligatoria.').not().isEmpty(),
//     existeProducto,
//     validarCampos
// ],putProducto);

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
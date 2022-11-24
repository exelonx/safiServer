const { Router } = require('express');
const { check, body } = require('express-validator');
const { getProductos, getProducto, postProducto, deleteProducto, putProducto, postCombo } = require('../../controllers/catalogo_ventas/producto.controllers');
const { validarCampos } = require('../../middlewares');
const { existeProducto, noExisteProductoPorId } = require('../../middlewares/validar-producto-existente');


const router = Router();

router.get('/', getProductos);

router.get('/:id', getProducto);

router.post('/', postProducto);
router.post('/combo/', postCombo);
router.post('/promocion');

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

// router.delete('/:id',[
//     check('quienElimina', 'El id es obligatorio').not().isEmpty(),
//     noExisteProductoPorId,
//     validarCampos
// ],deleteProducto);




module.exports = router
const { Router } = require('express');
const { check, body } = require('express-validator');
const { getProveedores, getProveedor, postProveedor, putProveedor, deleteProveedor } = require('../../controllers/inventario/proveedores.controllers');

const { validarCampos } = require('../../middlewares');
const { validarEspaciosProveedor } = require('../../middlewares/validaciones-proveedores');
const { existeProveedor, noExisteProveedorPorId } = require('../../middlewares/validar-proveedor-existente');

const router = Router();

router.get('/', getProveedores);

router.get('/:id', getProveedor);

router.post('/', [
    // Validar usuario quien lo creo
    check('id_usuario', 'El id es obligatorio').not().isEmpty(),
    // Validaciones del Proveedor
    validarEspaciosProveedor,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('nombre', 'Solo se permite texto').isAlpha('es-ES', {ignore: ' '}),
    check('nombre', 'Nombre debe estar en mayúscula').isUppercase(),
    check('nombre', 'Máximo de caracteres: 50').isLength({ max: 50 }),
    existeProveedor,
    // Validaciones de Teléfono
    check('telefono', 'Solo se permiten números en el telefono').not().isNumeric(),
    check('telefono', 'Máximo de caracteres: 15').isLength({ max: 15 }),
    // Validación de direccion
    check('direccion', 'La dirección debe estar en mayúscula').isUppercase(),
    check('direccion', 'Máximo de caracteres: 120').isLength({ max: 120 }),
    validarCampos
], postProveedor);

router.put('/actualizar-proveedor/:id', [
    //Validaciones de nombre del proveedor
    validarEspaciosProveedor,
    check('nombre', 'El nombre del proveedor deben ser solo letras').if(body('nombre').exists()).if(body('nombre').not().equals('')).isAlpha('es-ES', {ignore: ' '}),
    check('nombre', 'El usuario debe estar en mayúscula').isUppercase(),
    check('nombre', 'Máximo de caracteres: 50').isLength({ max: 50 }),
    //Validación si no existe el proveedor
    noExisteProveedorPorId,
    // Validaciones de Teléfono
    check('telefono', 'Solo se permiten números en el telefono').not().isNumeric(),
    check('telefono', 'Máximo de caracteres: 15').isLength({ max: 15 }),
    // Validación de direccion
    check('direccion', 'La dirección debe estar en mayúscula').isUppercase(),
    check('direccion', 'Máximo de caracteres: 120').isLength({ max: 120 }),
    existeProveedor,
    validarCampos
], putProveedor)

router.delete('/:id', [
    // Validar existencia
    check('quienElimina', 'El id del usuario es obligatorio').not().isEmpty(),
    noExisteProveedorPorId,
    validarCampos
], deleteProveedor);

module.exports = router;
const { Router } = require('express');
const { check, body } = require('express-validator');
const { getProveedores, getProveedor, postProveedor, putProveedor, deleteProveedor } = require('../../controllers/inventario/proveedores.controllers');
const { getReporteProveedor } = require('../../controllers/inventario/reporteria/proveedor.report.controller');

const { validarCampos, validarDobleEspacio} = require('../../middlewares');
const { validarEspaciosProveedor } = require('../../middlewares/validaciones-proveedores');
const { existeProveedor, noExisteProveedorPorId, existeProveedorPut } = require('../../middlewares/validar-proveedor-existente');

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
    check('nombre', 'Nombre debe estar solo en mayúscula').isUppercase(),
    check('nombre', 'Máximo de caracteres: 50').isLength({ max: 50 }),
    existeProveedor,
    // Validaciones de Teléfono
    check('telefono', 'Solo se permiten números en el teléfono').not().isNumeric(),
    check('telefono', 'Máximo de caracteres: 15').isLength({ max: 15 }),
    // Validación de direccion
    check('detalle', 'La dirección debe estar solo en mayúscula').isUppercase(),
    check('detalle', 'Máximo de caracteres: 120').isLength({ max: 120 }),
    check('detalle', 'La dirección es obligatoria').not().isEmpty(),
    check('id_municipio', 'El municipio es obligatorio').not().isEmpty(),
    validarCampos
], postProveedor);

router.put('/actualizar-proveedor/:id', [
    //Validaciones de nombre del proveedor
    validarEspaciosProveedor,
    check('nombre', 'El nombre del proveedor deben ser solo letras').if(body('nombre').exists()).if(body('nombre').not().equals('')).isAlpha('es-ES', {ignore: ' '}),
    check('nombre', 'El usuario debe estar solo en mayúscula').isUppercase(),
    check('nombre', 'Máximo de caracteres: 50').isLength({ max: 50 }),
    check("nombre", "No se permite más de un espacio en blanco entre palabras").custom(validarDobleEspacio),
    //Validación si no existe el proveedor
    noExisteProveedorPorId,
    // Validaciones de Teléfono
    check('telefono', 'Solo se permiten números en el telefono').not().isNumeric(),
    check('telefono', 'Máximo de caracteres: 15').isLength({ max: 15 }),
    // Validación de direccion
    check('direccion', 'La dirección debe estar en mayúscula').isUppercase(),
    check('direccion', 'Máximo de caracteres: 120').isLength({ max: 120 }),
    check("direccion", "No se permite más de un espacio en blanco entre palabras").custom(validarDobleEspacio),
    check('id_municipio', 'El municipio es obligatorio').not().isEmpty(),
    existeProveedorPut,
    validarCampos
], putProveedor)

router.delete('/:id', [
    // Validar existencia
    check('quienElimina', 'El usuario que elimina es obligatorio').not().isEmpty(),
    noExisteProveedorPorId,
    validarCampos
], deleteProveedor);

router.post('/reporteria/proveedor', getReporteProveedor);

module.exports = router;
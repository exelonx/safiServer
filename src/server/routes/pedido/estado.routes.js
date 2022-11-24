const { Router } = require('express');
const { check, body } = require('express-validator');
const { getEstados, putEstado, getEstado } = require('../../controllers/pedido/estado.controllers');

const { validarCampos, validarEspacio, validarDobleEspacio } = require('../../middlewares');
const { validarEspaciosProveedor } = require('../../middlewares/validaciones-proveedores');
const { existeProveedor, noExisteProveedorPorId } = require('../../middlewares/validar-proveedor-existente');

const router = Router();

router.get('/', getEstados);

router.get('/:id', getEstado);
/* 
router.post('/', [
    //Validaciones para el nombre del insumo
    check("nombre", "El nombre de insumo es obligatorio").not().isEmpty(), 
    check("nombre", "El nombre sólo permite letras").isAlpha("es-ES", {ignore: ' '}),
    check("nombre", 'El nombre debe estar en mayúscula').isUppercase(),
    check("nombre", "No se permite más de un espacio en blanco entre palabras").custom(validarDobleEspacio),
    //Obliga a escribir la unidad de medida del insumo
    check("id_unidad", "La unidad de medida es obligatoria").not().isEmpty(), 
    //Validaciones de cantidad maxima 
    check("cantidad_maxima", "La cantidad máxima es obligatoria").not().isEmpty(), 
    check("cantidad_maxima", "La cantidad máxima debe ser un número").isNumeric(),
    //Validaciones de cantidad minima 
    check("cantidad_minima", "La cantidad mínima es obligatoria").not().isEmpty(),
    check("cantidad_minima", "La cantidad mínima debe ser un número").isNumeric(),
    //ID del usuario que lo creo
    check("creado_por", "El id del usuario que lo creo es obligatorio").not().isEmpty(), 
    validarCampos
],postInsumo);*/

router.put('/editar-estado/:id', [
    //Validaciones para el nombre del insumo
    check("estado", "El nombre de insumo es obligatorio").not().isEmpty(), 
    /* check("estado", "El nombre sólo permite letras").isAlpha("es-ES", {ignore: ' '}),
    check("estado", 'El nombre debe estar en mayúscula').isUppercase(),
    check("estado", "No se permite más de un espacio en blanco entre palabras").custom(validarDobleEspacio), */
    //Obliga a escribir la unidad de medida del insumo
    /* check("id_unidad", "La unidad de medida es obligatoria").not().isEmpty(),  */
    //Validaciones de cantidad maxima 
    /* check("cantidad_maxima", "La cantidad máxima es obligatoria").not().isEmpty(), 
    check("cantidad_maxima", "La cantidad máxima debe ser un número").isNumeric(), */
    //Validaciones de cantidad minima 
    /* check("cantidad_minima", "La cantidad mínima es obligatoria").not().isEmpty(),
    check("cantidad_minima", "La cantidad mínima debe ser un número").isNumeric(), */
    //ID del usuario que lo creo
    check("quienModifico", "El id del usuario que lo creo es obligatorio").not().isEmpty(), 
    validarCampos
], putEstado);

/* router.delete('/:id_insumo', deleteInsumo)  */

module.exports = router;
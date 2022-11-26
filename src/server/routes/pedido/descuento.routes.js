const { Router } = require('express');
const { check, body } = require('express-validator');
const { getDescuentos, getDescuento, postDescuento, putDescuento, deleteDescuento } = require('../../controllers/pedido/descuento.controllers');

const { validarCampos, validarEspacio, validarDobleEspacio } = require('../../middlewares');

const router = Router();

router.get('/', getDescuentos);

router.get('/:id', getDescuento);

router.post('/', [
    //Validaciones para el nombre del insumo
    check("nombre", "El nombre de insumo es obligatorio").not().isEmpty(), 
    check("nombre", "El nombre sólo permite letras").isAlpha("es-ES", {ignore: ' '}),
    check("nombre", 'El nombre debe estar en mayúscula').isUppercase(),
    check("nombre", "No se permite más de un espacio en blanco entre palabras").custom(validarDobleEspacio),
    //Obliga a escribir la unidad de medida del insumo
    check("cantidad", "La cantidad de descuento es obligatoria").not().isEmpty(), 
    check("cantidad", "La cantidad debe ser un número").isNumeric(),
    //ID del usuario que lo creo
    check("id_usuario", "El id del usuario que lo creo es obligatorio").not().isEmpty(), 
    validarCampos
],postDescuento);

router.put('/:id', [
    //Validaciones para el nombre del insumo
    check("nombre", "El nombre de insumo es obligatorio").not().isEmpty(), 
    check("nombre", "El nombre sólo permite letras").isAlpha("es-ES", {ignore: ' '}),
    check("nombre", 'El nombre debe estar en mayúscula').isUppercase(),
    check("nombre", "No se permite más de un espacio en blanco entre palabras").custom(validarDobleEspacio),
    //Obliga a escribir la unidad de medida del insumo
    check("cantidad", "La cantidad de descuento es obligatoria").not().isEmpty(), 
    check("cantidad", "La cantidad debe ser un número").isNumeric(),
    //ID del usuario que lo creo
    check("id_usuario", "El id del usuario que lo creo es obligatorio").not().isEmpty(), 
    validarCampos
], putDescuento);

router.delete('/:id', [
    // Validar existencia
    check('quienElimina', 'El id del usuario es obligatorio').not().isEmpty(),
    validarCampos
], deleteDescuento);

module.exports = router;
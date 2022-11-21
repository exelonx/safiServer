const { Router } = require('express');
const { check, body } = require('express-validator');
const { getUnidades, getUnidad, postUnidad, deleteUnidad, putUnidad } = require('../../controllers/inventario/unidades.controllers');

const { validarCampos } = require('../../middlewares');
const { existeUnidad, noExisteUnidadPorId } = require('../../middlewares/validar-unidad-existente');

const router = Router();

router.get('/', getUnidades);

router.get('/:id', getUnidad);

router.post('/', [
    // Validar usuario quien lo creo
    check('id_usuario', 'El id es obligatorio').not().isEmpty(),
    // Validaciones de la unidad_medida
    check('unidad_medida', 'La unidad de medida es obligatoria').not().isEmpty(),
    check('unidad_medida', 'La unidad de medida debe estar en mayúscula').isUppercase(),
    check('unidad_medida', 'Máximo de caracteres: 6').isLength({ max: 4 }),
    check("unidad_medida", "La unidad de medida sólo permite letras").isAlpha("es-ES"),
    check('nombre', 'El nombre de medida es obligatoria').not().isEmpty(),
    check("nombre", "El nombre sólo permite letras").isAlpha("es-ES"),
    check('nombre', 'El nombre de medida debe estar en mayúscula').isUppercase(),
    check('nombre', 'Máximo de caracteres: 15').isLength({ max: 15 }),
    existeUnidad,
    validarCampos
], postUnidad);

router.put('/actualizar-unidad/:id', [
    //Validaciones de la unidad_medida
    check('unidad_medida', 'La unidad de medida debe estar en mayúscula').isUppercase(),
    check('unidad_medida', 'Máximo de caracteres: 6').isLength({ max: 4 }),
    check("unidad_medida", "La unidad de medida sólo permite letras").isAlpha("es-ES"),
    check("nombre", "El nombre sólo permite letras").isAlpha("es-ES"),
    check('nombre', 'El nombre de medida debe estar en mayúscula').isUppercase(),
    check('nombre', 'Máximo de caracteres: 15').isLength({ max: 15 }),
    // Validaciones de la unidad_medida
    noExisteUnidadPorId,
    validarCampos
], putUnidad)

router.delete('/:id', [
    // Validar existencia
    check('quienElimina', 'El id del usuario es obligatorio').not().isEmpty(),
    noExisteUnidadPorId,
    validarCampos
], deleteUnidad);

module.exports = router;
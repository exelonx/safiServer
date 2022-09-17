const { Router } = require('express');
const { check } = require('express-validator');
const { getRoles, getRol, postRol, putRol, DeleteRol } = require('../../controllers/rol.controllers');
const { validarCampos } = require('../../middlewares/validar-campos');
const { existenciaRolParaPut } = require('../../middlewares/validar-nombre-rol-put');
const { existeRol, noExisteRolPorId } = require('../../middlewares/validar-rol-existencia');

const router = Router();

router.get('/', getRoles);

router.get('/:id_rol', getRol);

router.post('/', [
    // Validaciones de Rol
    check('rol', 'El Rol es obligatorio').not().isEmpty(),
    check('rol', 'Rol debe estar en mayúscula').isUppercase(),
    check('rol').custom( existeRol ),
    // Validaciones de Descripción
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    check('descripcion', 'La descripción debe estar en mayúscula').isUppercase(),
    validarCampos
], postRol);

router.put('/:id_rol', [
    // Validaciones de Rol
    check( 'id_rol' ).custom( noExisteRolPorId ),
    check('rol', 'Rol debe estar en mayúscula').isUppercase(),
    // Validaciones de Descripción
    check('descripcion', 'La descripción debe estar en mayúscula').isUppercase(),
    existenciaRolParaPut,
    validarCampos
], putRol);

router.delete('/:id_rol', [
    // Validar existencia
    check( 'id_rol' ).custom( noExisteRolPorId ),
    validarCampos
], DeleteRol);

module.exports = router;
const { Router } = require('express');
const { check } = require('express-validator');

const { getRoles,
        getRol,
        postRol,
        putRol,
        DeleteRol } = require('../../controllers/seguridad/rol.controllers');

const {validarCampos,
       existenciaRolParaPut,
       existeRol,
       noExisteRolPorId,
       noExisteUsuario} = require('../../middlewares')

const router = Router();

router.get('/', getRoles);

router.get('/:id_rol', getRol);

router.post('/', [
    // Validar usuario quien lo creo
    check('id_usuario', 'El id es obligatorio').not().isEmpty(),
    noExisteUsuario,
    // Validaciones de Rol
    check('rol', 'El Rol es obligatorio').not().isEmpty(),
    check('rol', 'Rol debe estar en mayúscula').isUppercase(),
    check('rol', 'Máximo de caracteres: 30').isLength({ max: 30 }),
    check('rol', 'Solo se permiten letras').isAlpha('es-ES', {ignore: ' '}),
    existeRol,
    // Validaciones de Descripción
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    check('descripcion', 'La descripción debe estar solo en mayúscula').isUppercase(),
    check('descripcion', 'Máximo de caracteres: 100').isLength({ max: 100 }),
    validarCampos
], postRol);

router.put('/:id_rol', [
    // Validaciones de Rol
    noExisteRolPorId,
    check('rol', 'Rol debe estar en mayúscula').isUppercase(),
    check('rol', 'Máximo de caracteres: 30').isLength({ max: 30 }),
    check('rol', 'Solo se permiten letras', {ignore: ' '}).isAlpha('es-ES'),
    // Validaciones de Descripción
    check('descripcion', 'La descripción debe estar solo en mayúscula').isUppercase(),
    check('descripcion', 'Máximo de caracteres: 100').isLength({ max: 100 }),
    existenciaRolParaPut,
    validarCampos
], putRol);

router.delete('/:id_rol', [
    // Validar existencia
    check('quienElimina', 'El usuario que elimina es obligatorio').not().isEmpty(),
    noExisteRolPorId,
    validarCampos
], DeleteRol);

module.exports = router;
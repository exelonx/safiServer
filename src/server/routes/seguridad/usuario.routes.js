const { Router } = require('express');
const { check, body } = require("express-validator");

const { validarCampos,
    validarLongitudDBContra,
    validarContraseña,
    existeUsuario,
    validarEspacio,
    existeUsuarioUpdated,
    existeIDUsuario,
    validarEspaciosUsuario
    
} = require('../../middlewares');
    
const { registrar, getUsuarios, getUsuario, bloquearUsuario, putContrasena, putUsuario } = require('../../controllers/seguridad/usuario.controllers');

const { emailExistente, emailExistenteUpdate } = require('../../helpers/db-validators');

const router = Router();

// APIs

router.post('/registro', [
    //Validaciones de usuario
    check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    check('usuario', 'El usuario debe estar en mayúscula').isUppercase(),
    check('usuario', 'El máximo de carácteres son de 15').isLength({max: 15}),
    check('usuario', 'No se permite espacios en blanco en el usuario').custom(validarEspacio),
    // Validaciones de nombre de usuario
    check('nombre_usuario', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('nombre_usuario', 'El nombre de usuario debe estar en mayúscula').isUppercase(),
    check('nombre_usuario', 'Solo se permite un espacio entre palabras.').custom(validarEspaciosUsuario),
    // validaciones de correo
    check('correo', 'El correo es obligatorio').not().isEmpty(),
    check('correo', 'El correo no es valido').isEmail(),
    check('correo').custom(emailExistente),
    // Validar contraseña
    existeUsuario,
    validarLongitudDBContra,
    validarContraseña,
    validarCampos
], registrar)

router.get('/', getUsuarios);

router.get('/:id_usuario', getUsuario)

router.put('/bloquear/:id_usuario', bloquearUsuario)

router.put('/cambiar-contrasena/:id_usuario', [
    // Validar contraseña
    validarLongitudDBContra,
    validarContraseña,
    check('confirmContrasena', "La confirmación es obligatoria").not().isEmpty(),
    check('quienModifico', "El usuario quien modifico es obligatorio").not().isEmpty(),
    validarCampos
], putContrasena)

router.put('/actualizar/:id_usuario', [
        //Validaciones de usuario
        check('usuario', 'El usuario debe estar en mayúscula').isUppercase(),
        check('usuario', 'El máximo de carácteres son de 15').isLength({max: 15}),
        check('usuario', 'No se permite espacios en blanco en el usuario').custom(validarEspacio),
        // Validaciones de nombre de usuario
        check('nombre_usuario', 'El nombre de usuario debe estar en mayúscula').isUppercase(),
        // validaciones de correo
        check('correo', 'El correo no es valido').if(body('correo').exists()).isEmail(),
        emailExistenteUpdate,
        // Validar contraseña
        existeUsuarioUpdated,
        validarCampos
], putUsuario)

module.exports = router;
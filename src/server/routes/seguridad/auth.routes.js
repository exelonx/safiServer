const { Router } = require('express');
const { check } = require("express-validator");

const { login, 
        revalidarToken, 
        generarCorreoRecuperacion, 
        revalidarTokenCorreo, 
        usuarioPorUsernameRecovery, 
        revalidarTokenPregunta } = require('../../controllers/seguridad/auth.controllers');

const {validarCampos,
       validarJWT,
       validarEspaciosLogin,
       validarLongitudDBContra,
       validarCorreoJWT,
       validarPreguntaJWT} = require('../../middlewares')

const router = Router();

//Login de usuario
router.post('/login', [
    // Validaciones de usuario
    check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    check('usuario', 'Usuario debe estar en Mayúsculas').isUppercase(),
    check('usuario', 'Máximo de 15 carácteres').isLength({ max: 15 }),
    // Validaciones de contraseña
    check('contrasena', 'La contraseña es obligatoria').not().isEmpty(),
    validarLongitudDBContra,
    // Validaciones genericas
    validarEspaciosLogin,
    validarCampos,
], login)

//Validar y revalidar token
router.get('/revalidar', [
    validarJWT,
    revalidarToken
], revalidarToken)

//API para solicitar correo de recuperación
router.post('/generar-correo-recuperacion', [
    // Validaciones de usuario
    check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    check('usuario', 'Usuario debe estar en Mayúsculas').isUppercase(),
    check('usuario', 'Máximo de 15 carácteres').isLength({ max: 15 }),
], generarCorreoRecuperacion)

//API para validar token de correo de recuperación
router.get('/validar-token-correo/:token', [
    validarCorreoJWT
], revalidarTokenCorreo)

//API para validar token de preguntas secretas
router.get('/validar-token-pregunta/:token', [
    validarPreguntaJWT
], revalidarTokenPregunta)

router.post('/buscar/username-password', [
    // Validaciones de usuario
    check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    check('usuario', 'Usuario debe estar en Mayúsculas').isUppercase(),
    check('usuario', 'Máximo de 15 carácteres').isLength({ max: 15 }),
], usuarioPorUsernameRecovery)

module.exports = router;
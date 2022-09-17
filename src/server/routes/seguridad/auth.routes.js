const { Router } = require('express');
const { check } = require("express-validator");

const { validarCampos } = require("../../middlewares/validar-campos");
const { validarJWT } = require("../../middlewares/validar-jwt");
const { login, revalidarToken } = require('../../controllers/seguridad/auth.controllers');
const { validarEspaciosLogin } = require('../../middlewares/validar-espacios');
const { validarLongitudDBContra } = require('../../middlewares/validar-longitudDB-contraseña');

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
router.get('/renew', [
    validarJWT,
    revalidarToken
], )

module.exports = router;
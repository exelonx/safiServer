const { Router } = require('express');
const { check } = require("express-validator");

const { validarCampos } = require("../../middlewares/validar-campos");
const { validarJWT } = require("../../middlewares/validar-jwt");
const { login, revalidarToken } = require('../../controllers/auth.controllers');
const { validarEspaciosLogin } = require('../../middlewares/validar-espacios');
const { validarLongitudDBContra } = require('../../middlewares/validar-longitudDB-contraseña');
const { registrar } = require('../../controllers/usuario.controllers');
const { emailExistente } = require('../../helpers/db-validators');
const { validarContraseña } = require('../../middlewares/validar-contraseña');

const router = Router();

router.post('/registro', [
    check('usuario', 'El usuario el obligatorio').not().isEmpty(),
    check('nombre_usuario', 'El nombre de usuario el obligatorio').not().isEmpty(),
    check('correo', 'El correo no es valido').isEmail(),
    check('correo').custom(emailExistente),
    validarEspaciosLogin,
    validarLongitudDBContra,
    validarContraseña,
    validarCampos
], registrar)

router.get('/actualizar',  )

module.exports = router;
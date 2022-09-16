const { Router } = require('express');
const { check } = require("express-validator");

const { validarCampos } = require("../../middlewares/validar-campos");
const { validarJWT } = require("../../middlewares/validar-jwt");
const { login, revalidarToken } = require('../../controllers/auth.controllers');
const { validarEspaciosLogin } = require('../../middlewares/validar-espacios');
const { validarLongitudDB } = require('../../middlewares/validar-longitudDB');
const { registrar } = require('../../controllers/usuario.controllers');

const router = Router();

router.post('/registro', [
    // Validaciones 
], registrar)

router.get('/actualizar',  )

module.exports = router;
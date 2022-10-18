const { Router } = require('express');
const { check } = require('express-validator');

const { getBitacora,
        registrarIngreso, 
        registrarUsuarioDesconectado} = require('../../controllers/administracion/bitacora.controller');

const router = Router();

router.get('/', getBitacora);

router.post('/ingreso', registrarIngreso)

router.post('/logout', registrarUsuarioDesconectado)

module.exports = router
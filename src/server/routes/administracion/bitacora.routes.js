const { Router } = require('express');
const { check } = require('express-validator');

const { getBitacora,
        registrarIngreso } = require('../../controllers/administracion/bitacora.controller');

const router = Router();

router.get('/', getBitacora);

router.post('/ingreso', registrarIngreso)

module.exports = router
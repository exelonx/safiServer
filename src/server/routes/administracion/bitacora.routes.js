const { Router } = require('express');
const { check } = require('express-validator');
const { getBitacora } = require('../../controllers/administracion/bitacora.controller');

const router = Router();

router.get('/', getBitacora);

module.exports = router
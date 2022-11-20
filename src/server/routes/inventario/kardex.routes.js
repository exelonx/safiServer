const { Router } = require('express');
const { check, body } = require('express-validator');
const { getKardex, validarIdInsumoKardex, getNombreInsumo } = require('../../controllers/inventario/kardex.controllers');

const router = Router();

router.get('/', getKardex);

router.get('/validar/:id_insumo', validarIdInsumoKardex);

router.get('/nombre/:id_insumo', getNombreInsumo);

module.exports = router;
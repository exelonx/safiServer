const { Router } = require('express');
const { check } = require('express-validator');
const { getParametros, getParametro, putParametro } = require('../../controllers/seguridad/parametros.controllers');
const { validarCampos } = require('../../middlewares/validar-campos');

const router = Router();

router.get('/', getParametros);

router.get('/:id_parametro', getParametro);

router.put('/:id_parametro', [
    // TODO: Colocar validaciones especiales acá
    // ---------- AQUÍ ----------
    validarCampos
], putParametro);

module.exports = router;
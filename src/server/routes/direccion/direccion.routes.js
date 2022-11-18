const { Router } = require('express');
const { check, body } = require('express-validator');
const { getDepartamentos, getMunicipios } = require('../../controllers/direccion/direccion.controllers');

const { validarCampos } = require('../../middlewares');
const { existeUnidad, noExisteUnidadPorId } = require('../../middlewares/validar-unidad-existente');

const router = Router();

router.get('/', getDepartamentos);

router.get('/municipios', getMunicipios);

module.exports = router;
const { Router } = require('express');
const { check } = require('express-validator');
const { getCatalogos } = require('../../controllers/catalogo_ventas/catalogo.controllers');
const { validarCampos } = require('../../middlewares');


const router = Router();

router.get('/',getCatalogos);

module.exports = router
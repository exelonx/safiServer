const { Router } = require('express');
const { check, body } = require('express-validator');
const { getImpuestos, getImpuesto, postImpuesto, putImpuesto, deleteImpuesto } = require('../../controllers/catalogo_ventas/tipo-impuesto.controllers');
const { getTipoProducto } = require('../../controllers/catalogo_ventas/tipoProducto.controllers');
const { validarCampos, validarDobleEspacio } = require('../../middlewares');


const router = Router();

router.get('/', getTipoProducto);

module.exports = router
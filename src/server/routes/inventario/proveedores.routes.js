const { Router } = require('express');
const { check } = require('express-validator');
const { getProveedores } = require('../../controllers/inventario/proveedores.controllers');

const { getParametros,
        getParametro, 
        putParametro } = require('../../controllers/seguridad/parametros.controllers');

const { validarCampos,
        validarCamposYExistenciaParametros } = require('../../middlewares');

const router = Router();

router.get('/', getProveedores);



module.exports = router;
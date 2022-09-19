const { Router } = require('express');
const { check } = require('express-validator');
const { getPermisos, getPermiso, putPermisos } = require('../../controllers/seguridad/permisos.controllers');
const { validarCampos } = require('../../middlewares');


const router = Router();

router.get('/', getPermisos);

router.get('/:id_rol', getPermiso);

router.put('/:id_permiso',[
    validarCampos
],putPermisos);

module.exports = router;
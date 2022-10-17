const { Router } = require('express');
const { check, body } = require('express-validator');

const { getPermisos,
        getPermiso,
        putPermisos } = require('../../controllers/seguridad/permisos.controllers');

const { validarCampos } = require('../../middlewares');

const router = Router();

router.get('/', getPermisos);

router.get('/:id_rol', getPermiso);

router.put('/:id_permiso',[
    check('permiso_insercion', 'solo datos booleanos').if(body('permiso_insercion').exists()).isBoolean(),
    check('permiso_eliminacion', 'solo datos booleanos').if(body('permiso_eliminacion').exists()).isBoolean(),
    check('permiso_actualizacion', 'solo datos booleanos').if(body('permiso_actualizacion').exists()).isBoolean(),
    check('permiso_consultar', 'solo datos booleanos').if(body('permiso_consultar').exists()).isBoolean(),
    validarCampos
],putPermisos);

module.exports = router;
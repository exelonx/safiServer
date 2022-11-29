const { Router } = require('express');
const { check, body } = require('express-validator');
const { getReportePermiso } = require('../../controllers/reporteria/permiso.report.controller');

const { getPermisos,
        getPermiso,
        putPermisos, 
        configPermisosIniciales,
        validarPermiso} = require('../../controllers/seguridad/permisos.controllers');

const { validarCampos } = require('../../middlewares');

const router = Router();

router.get('/', getPermisos);

router.get('/:id_permiso', getPermiso);

router.put('/:id_permiso',[
    check('permiso_insercion', 'solo datos booleanos').if(body('permiso_insercion').exists()).isBoolean(),
    check('permiso_eliminacion', 'solo datos booleanos').if(body('permiso_eliminacion').exists()).isBoolean(),
    check('permiso_actualizacion', 'solo datos booleanos').if(body('permiso_actualizacion').exists()).isBoolean(),
    check('permiso_consultar', 'solo datos booleanos').if(body('permiso_consultar').exists()).isBoolean(),
    validarCampos
],putPermisos);

router.get('/config/inicial', configPermisosIniciales)

router.get('/consulta/:pantalla', validarPermiso)

router.post('/reporteria/permiso', getReportePermiso);

module.exports = router;
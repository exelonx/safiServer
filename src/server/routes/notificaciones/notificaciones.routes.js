const { Router } = require('express');
const { check } = require('express-validator');
const { getNotificacionesCampana, postNotificacion, configPermisosInicialesNoti, recibirNotificacion, verNotificacion, getTipoNotificacion, getPermisosNotificaciones, putPermisos, getPermisoNotificacion } = require('../../controllers/notificaciones/notificaciones.controllers');
const { getReportePermisoNoti } = require('../../controllers/reporteria/permisoNoti.report.controller');
const { validarCampos } = require('../../middlewares');

const router = Router();

router.get('/', getNotificacionesCampana);

router.get('/:id_notificacion', recibirNotificacion)

router.post('/', [
    check('idTipoNotificacion', 'El id del tipo de notificación es obligatorio').not().isEmpty(),
    check('accion', 'La acción realizada es obligatoria').not().isEmpty(),
    check('detalle', 'El detalle de la notificación es obligatorio').not().isEmpty(),
    validarCampos
], postNotificacion);

router.get('/buscar/:id_notificacion', verNotificacion)

router.get('/config/permisos', configPermisosInicialesNoti);

router.get('/tipo/get', getTipoNotificacion)

router.get('/permiso/get', getPermisosNotificaciones)

router.put('/:id_permiso', putPermisos)

router.get('/permiso/get/:id_permiso', getPermisoNotificacion)

router.post('/reporteria/permisoNoti', getReportePermisoNoti);

module.exports = router
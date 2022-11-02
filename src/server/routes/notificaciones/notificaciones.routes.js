const { Router } = require('express');
const { check } = require('express-validator');
const { getNotificacionesCampana, postNotificacion, configPermisosInicialesNoti } = require('../../controllers/notificaciones/notificaciones.controllers');
const { validarCampos } = require('../../middlewares');

const router = Router();

router.get('/', getNotificacionesCampana);

router.post('/', [
    check('idTipoNotificacion', 'El id del tipo de notificación es obligatorio').not().isEmpty(),
    check('accion', 'La acción realizada es obligatoria').not().isEmpty(),
    check('detalle', 'El detalle de la notificación es obligatorio').not().isEmpty(),
    validarCampos
], postNotificacion);

router.get('/config', configPermisosInicialesNoti);

router.get('/banner', (req, res)=>{
    console.log(__dirname)
    res.sendFile('C:/Users/Kevin/Documents/PROYECTO DRBURGER/safiServer/src/assets/svg/DrBurger.png');
})


module.exports = router
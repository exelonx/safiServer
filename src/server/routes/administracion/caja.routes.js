const { Router } = require('express');
const { check, body } = require('express-validator');
const { getCaja, getCajas, getCajaAbierta, postCaja, deleteCaja, putCaja } = require('../../controllers/administracion/caja.controller');
const { getReporteCaja } = require('../../controllers/administracion/reporteria/caja.report.controller');

const { validarCampos } = require('../../middlewares');

const router = Router();

router.get('/', getCajas);

// router.get('/:id', getCaja);

router.get('/abierta', getCajaAbierta);

router.post('/crear/',[
    // Validar usuario quien lo creo
    check('id_usuario', 'El id es obligatorio').not().isEmpty(),
    // Validar saldo apertura para que sea obligatorio
    check('saldo_apertura', 'El saldo de apertura es obligatorio').not().isEmpty(),
    check('saldo_apertura', 'Solo se permiten números en el saldo de apertura').isNumeric(),
    validarCampos
], postCaja)

router.put('/:id', [
    // Validar usuario quien lo creo
    check('id_usuario', 'El id es obligatorio').not().isEmpty(),
],putCaja)

router.delete('/:id', [
    // Validar existencia
    check('quienElimina', 'El id del usuario es obligatorio').not().isEmpty(),
    validarCampos
], deleteCaja);

router.post('/reporteria/caja', getReporteCaja);

module.exports = router;
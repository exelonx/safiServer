const { Router } = require('express');
const { check, body } = require('express-validator');
const { getEstados, putEstado, getEstado } = require('../../controllers/pedido/estado.controllers');
const { getReporteEstado } = require('../../controllers/pedido/reporteria/estado.report.controller');

const { validarCampos } = require('../../middlewares');

const router = Router();

router.get('/', getEstados);

router.get('/:id', getEstado);

router.put('/editar-estado/:id', [
    //Validaciones para el nombre del estado
    check("id_usuario", "El nombre del usuario es obligatorio").not().isEmpty(), 
    check("color", "El color es obligatorio").not().isEmpty(), 
    validarCampos
], putEstado);

router.post('/reporteria/estado', getReporteEstado);


module.exports = router;
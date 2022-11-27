const { Router } = require('express');
const { getInventarios } = require('../../controllers/inventario/inventario.controllers');
const { getReporteInventario } = require('../../controllers/inventario/reporteria/inventario.report.controller');


const router = Router();

router.get('/', getInventarios);

router.post('/reporteria/inventario', getReporteInventario);

module.exports = router;
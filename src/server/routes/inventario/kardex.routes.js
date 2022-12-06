const { Router } = require('express');
const { getKardex, validarIdInsumoKardex, getNombreInsumo } = require('../../controllers/inventario/kardex.controllers');
const { getReporteKardex } = require('../../controllers/inventario/reporteria/kardex.report.controller');

const router = Router();

router.get('/', getKardex);

router.get('/validar/:id_insumo', validarIdInsumoKardex);

router.get('/nombre/:id_insumo', getNombreInsumo);

router.post('/reporteria/kardex', getReporteKardex);

module.exports = router;
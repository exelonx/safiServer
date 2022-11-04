const { Router } = require('express');
const { getReporteBitacora } = require('../../controllers/reporteria/bitacora.report.controllers');
const { getReporteRol } = require('../../controllers/reporteria/rol.report.controller');

const router = Router();

router.post('/bitacora', getReporteBitacora);

router.post('/usuario', )

router.post('/rol', getReporteRol)

router.post('/parametro', )

module.exports = router
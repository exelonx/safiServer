const { Router } = require('express');
const { getReporteBitacora } = require('../../controllers/reporteria/bitacora.report.controllers');
const { getReporteParametro } = require('../../controllers/reporteria/parametro.report.controller');
const { getReporteRol } = require('../../controllers/reporteria/rol.report.controller');
const { getReporteUsuario } = require('../../controllers/reporteria/usuario.report.controller');


const router = Router();

router.post('/bitacora', getReporteBitacora);

router.post('/usuario', getReporteUsuario);

router.post('/rol', getReporteRol)

router.post('/parametro', getReporteParametro )

module.exports = router
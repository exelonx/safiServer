const { Router } = require('express');
const { getReporteBitacora } = require('../../controllers/reporteria/bitacora.report.controllers');

const router = Router();

router.post('/bitacora', getReporteBitacora);

router.post('/usuario', )

router.post('/rol', )

router.post('/parametro', )

module.exports = router
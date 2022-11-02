const { Router } = require('express');
const { getReporteBitacora } = require('../../controllers/reporteria/bitacora.report.controllers');

const router = Router();

router.post('/bitacora', getReporteBitacora);

module.exports = router
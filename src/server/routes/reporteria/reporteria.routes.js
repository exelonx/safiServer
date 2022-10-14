const { Router } = require('express');
const { getReporte } = require('../../controllers/reporteria/reporteria.controllers');

const router = Router();

router.get('/', getReporte);

module.exports = router
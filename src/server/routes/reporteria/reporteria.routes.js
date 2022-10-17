const { Router } = require('express');

const { getReporte } = require('../../controllers/reporteria/reporteria.controllers');

const router = Router();

router.post('/', getReporte);

module.exports = router
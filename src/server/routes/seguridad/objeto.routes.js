const { Router } = require('express');
const { check } = require('express-validator');
const { getPantallas } = require('../../controllers/seguridad/objeto.controllers');

const router = Router();

router.get('/', getPantallas);

module.exports = router;
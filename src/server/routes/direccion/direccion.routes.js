const { Router } = require('express');
const { getDepartamentos, getMunicipios } = require('../../controllers/direccion/direccion.controllers');

const router = Router();

router.get('/', getDepartamentos);

router.get('/municipios/:id_departamento', getMunicipios);

module.exports = router;
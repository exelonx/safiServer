const { Router } = require('express');
const { check, body } = require('express-validator');
const { postBackup, getBackup, validarConexion } = require('../../controllers/administracion/backup.controller');

const { generarBackup } = require('../../jobs/db-backup');
const { validarEspacio, validarDobleEspacio, validarCampos } = require('../../middlewares');

const router = Router();

router.get('/', getBackup);

router.get('/validar-conexion', validarConexion)

router.post('/subir',[
  check("ubicacion", "la ubicacion del backup sólo permite letras").if(body('ubicacion').exists()).if(body('ubicaciono').not().equals('')).isAlpha("es-ES", {ignore: '/'}),
  validarCampos
], postBackup)

module.exports = router
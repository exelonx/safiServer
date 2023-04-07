const { Router } = require('express');
const { check, body } = require('express-validator');
const { postBackup, getBackup, validarConexion, putBackup } = require('../../controllers/administracion/backup.controller');

const { generarBackup } = require('../../jobs/db-backup');
const { validarEspacio, validarDobleEspacio, validarCampos } = require('../../middlewares');
const { validarBackup } = require('../../middlewares/validar-backup');

const router = Router();

router.get('/', getBackup);

router.get('/validar-conexion', validarConexion)

router.post('/subir',[
  check("ubicacion", "la ubicación del backup solo permite letras").if(body('ubicacion').exists()).if(body('ubicaciono').not().equals('')).isAlpha("es-ES", {ignore: '/'}),
  validarCampos
], postBackup)

router.put('/actualizar',[
  validarBackup
], putBackup)

module.exports = router
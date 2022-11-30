const { Router } = require('express');
const { check } = require('express-validator');
const { postBackup, getBackup, validarConexion } = require('../../controllers/administracion/backup.controller');

const { generarBackup } = require('../../jobs/db-backup');
const { validarEspacio, validarDobleEspacio, validarCampos } = require('../../middlewares');

const router = Router();

router.get('/', getBackup);

router.get('/validar-conexion', validarConexion)

router.post('/subir',[
  check("nombreBackup", "El nombre del backup sólo permite letras").isAlpha("es-ES", {ignore: ''}),
  check("nombreBackup", "El nombre del backup debe ser en mayúsculas").isUppercase(),
  validarCampos
], postBackup)

module.exports = router
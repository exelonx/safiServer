const { Router } = require('express');
const { check } = require('express-validator');
const { cargarArchivo, actualizarImagen, mostrarImagen } = require('../../controllers/seguridad/uploads.controllers');
const { coleccionesPermitidas } = require('../../helpers/db-validators');
const { validarCampos, noExisteUsuario } = require('../../middlewares');
const { validarArchivoSubir } = require('../../middlewares/validar-archivo');

const router = Router();

router.post('/', validarArchivoSubir, cargarArchivo);

router.put('/:coleccion/:id_usuario',[
    validarArchivoSubir,
    check('coleccion').custom(c => coleccionesPermitidas(c, ['usuario'])),
    validarCampos
], actualizarImagen);

router.get('/:coleccion/:id_usuario', [
    check('coleccion').custom(c => coleccionesPermitidas(c, ['usuario'])),
    validarCampos
], mostrarImagen)

module.exports = router;
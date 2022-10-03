const validarCampos = require('../middlewares/validar-campos');
const validarContraseña = require('../middlewares/validar-contraseña');
const validarEspaciosLogin = require('../middlewares/validar-espacios');
const validarJWT = require('../middlewares/validar-jwt');
const validarLongitudDBContra = require('../middlewares/validar-longitudDB-contraseña');
const existenciaRolParaPut = require('../middlewares/validar-nombre-rol-put');
const validarRolExistente = require('../middlewares/validar-rol-existencia');
const validarRespuestas = require('../middlewares/validacion-respuestas')
const validarParametros = require('../middlewares/validaciones-parametro');
const validarPreguntas = require('../middlewares/validaciones-pregunta');
const validarUsuario = require('../middlewares/validaciones-usuarios');
const validarEspaciosdeRespuesta = require('../middlewares/validar-espacios-respuesta');
module.exports = {
    ...validarCampos,
    ...validarContraseña,
    ...validarEspaciosLogin,
    ...validarJWT,
    ...validarLongitudDBContra,
    ...existenciaRolParaPut,
    ...validarRolExistente,
    ...validarRespuestas,
    ...validarParametros,
    ...validarPreguntas,
    ...validarUsuario,
    ...validarEspaciosdeRespuesta
}
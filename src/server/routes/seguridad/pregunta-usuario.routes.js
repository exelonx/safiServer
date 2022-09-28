const { Router } = require('express');
const { check } = require('express-validator');
const { getPreguntasAllUsuarios, getPregunta, postRespuesta, putRespuesta, getPreguntasUsuario } = require('../../controllers/seguridad/pregunta-usuario.controllers');

const { noExisteRespuesta,
        validarCampos } = require('../../middlewares');
// const { validarCampos } = require('../../middlewares/validar-campos');

const router = Router();

router.get('/', getPreguntasAllUsuarios);

router.get('/:id_pregunta', getPregunta);

router.get('/get-preguntas-usuario/:id_usuario', getPreguntasUsuario) // Api para traer todas las preguntas de un usuario

router.post('/', [
    // Validaciones de usuarios y preguntas
    check('id_pregunta', 'La pregunta es obligatoria').not().isEmpty(),
    check('id_usuario', 'El usuario es obligatoria').not().isEmpty(),
    // Validaciones de respuesta
    check('respuesta', 'La pregunta es obligatoria').not().isEmpty(),
    check('respuesta', 'La pregunta debe estar en Mayúsculas').isUppercase(),
    validarCampos
], postRespuesta);

router.put('/:id_respuesta', [
    // Validar existencia
    check('id_respuesta').custom( noExisteRespuesta ),
    // Validaciones de preguntas
    check('id_pregunta', 'La pregunta es obligatoria').not().isEmpty(),
    // Validaciones de respuesta
    check('respuesta', 'La pregunta es obligatoria').not().isEmpty(),
    check('respuesta', 'La pregunta debe estar en Mayúsculas').isUppercase(),
    check('respuesta', 'Máximo de caracteres: 100').isLength({ max: 100 }),
    validarCampos
], putRespuesta);

module.exports = router;
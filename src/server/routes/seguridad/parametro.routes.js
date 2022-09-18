const { Router } = require('express');
const { check } = require('express-validator');
const { getPreguntasAllUsuarios, getPregunta, postRespuesta, putRespuesta } = require('../../controllers/seguridad/pregunta-usuario.controllers');
const { noExisteRespuesta } = require('../../middlewares');
const { validarCampos } = require('../../middlewares/validar-campos');

const router = Router();

router.get('/', getPreguntasAllUsuarios);

router.get('/:id_parametro', getPregunta);

router.put('/:id_parametro', [
    // Validar existencia
    check('id_respuesta').custom( noExisteRespuesta ),
    // Validaciones de preguntas
    check('id_pregunta', 'La pregunta es obligatoria').not().isEmpty(),
    // Validaciones de respuesta
    check('respuesta', 'La pregunta es obligatoria').not().isEmpty(),
    check('respuesta', 'La pregunta debe estar en Mayúsculas').isUppercase(),
    validarCampos
], putRespuesta);

module.exports = router;
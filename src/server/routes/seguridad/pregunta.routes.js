const { Router } = require('express');
const { check } = require('express-validator');

const { getPreguntas,
        getPregunta,
        postPregunta,
        putPregunta,
        deletePregunta } = require('../../controllers/seguridad/pregunta.controllers');

const { noExistePregunta,
        validarCampos, 
        noEsPregunta} = require('../../middlewares');

const router = Router();

router.get('/', getPreguntas);

router.get('/:id_pregunta', getPregunta);

router.post('/', [
    check('pregunta', 'La pregunta es obligatoria').not().isEmpty(),
    check('pregunta', 'La pregunta debe estar en Mayúsculas').isUppercase(),
    check('pregunta').custom(noEsPregunta),
    validarCampos
], postPregunta);

router.put('/:id_pregunta', [
    check('id_pregunta').custom( noExistePregunta ),
    check('pregunta', 'La pregunta es obligatoria').not().isEmpty(),
    check('pregunta', 'La pregunta debe estar en Mayúsculas').isUppercase(),
    validarCampos
], putPregunta);

router.delete('/:id_pregunta', [
    check('id_pregunta').custom( noExistePregunta ),
    validarCampos
], deletePregunta);

module.exports = router;
const { Router } = require('express');
const { check, body } = require('express-validator');

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
    check('pregunta', 'La pregunta debe estar solo en mayúsculas').isUppercase(),
    check('pregunta', 'No se permiten carácteres especiales').isAlpha('es-ES', {ignore: '¿? '}),
    check('pregunta').custom(noEsPregunta),
    validarCampos
], postPregunta);

router.put('/:id_pregunta', [
    check('id_pregunta').custom( noExistePregunta ),
    check('pregunta', 'La pregunta es obligatoria').not().isEmpty(),
    check('pregunta', 'La pregunta debe estar solo en mayúsculas').isUppercase(),
    check('pregunta', 'No se permiten carácteres especiales').if(body('pregunta').exists()).if(body('pregunta').not().equals('')).isAlpha('es-ES', {ignore: '¿? '}),
    check('pregunta').if(body('pregunta').exists()).if(body('pregunta').not().equals('')).custom(noEsPregunta),
    validarCampos
], putPregunta);

router.delete('/:id_pregunta', [
    check('id_pregunta').custom( noExistePregunta ),
    validarCampos
], deletePregunta);

module.exports = router;
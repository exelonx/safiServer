const { Router } = require('express');
const { check } = require('express-validator');

const { getParametros,
        getParametro, 
        putParametro, 
        deleteParametro,
        postParametro} = require('../../controllers/seguridad/parametros.controllers');

const { validarCampos,
        validarCamposYExistenciaParametros } = require('../../middlewares');

const router = Router();

router.get('/', getParametros);

router.get('/:id_parametro', getParametro);
    
router.post('/', [
    check('valor', 'El valor del parámetro es obligatorio').not().isEmpty(),
    check('id_quienCreo', 'El usuario es obligatorio').not().isEmpty(),
    check('parametro', 'El parámetro es obligatorio').not().isEmpty(),
    check('parametro', 'El parámetro debe estar solo en mayúsculas').isUppercase(),
    check('parametro', 'El parámetro debe ser texto').isAlpha('es-ES', {ignore: '_ '}),
    validarCampos
], postParametro);

router.put('/:id_parametro', [
    // Validar que venga el campo
    check('valor', 'El valor del parámetro es obligatorio').not().isEmpty(),
    check('id_usuario', 'El usuario es obligatorio').not().isEmpty(),
    validarCampos,
    // Validaciones personalizadas
    validarCamposYExistenciaParametros
], putParametro);

router.delete('/:id_parametro', [
    check('id_quienElimino', 'El usuario que elimina es obligatorio').not().isEmpty(),
    validarCampos
], deleteParametro)

module.exports = router;
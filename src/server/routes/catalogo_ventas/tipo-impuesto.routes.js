const { Router } = require('express');
const { check, body } = require('express-validator');
const { getReporteImpuesto } = require('../../controllers/catalogo_ventas/reporteria/tipo-impuesto.report.controller');
const { getImpuestos, getImpuesto, postImpuesto, putImpuesto, deleteImpuesto } = require('../../controllers/catalogo_ventas/tipo-impuesto.controllers');
const { validarCampos, validarDobleEspacio } = require('../../middlewares');


const router = Router();

router.get('/', getImpuestos);

router.get('/:id', getImpuesto);

router.post('/',[
    check('id_usuario', 'El id es obligatorio.').not().isEmpty(),
    check('nombre', 'El nombre es obligatorio.').not().isEmpty(),
    check('nombre', 'Solo se permite texto').isAlpha('es-ES', {ignore: ' '}),
    check('nombre', 'Nombre debe estar solo en mayúscula').isUppercase(),
    check('nombre', 'Máximo de carácteres: 100').isLength({ max: 100 }),
    check("nombre", "No se permite más de un espacio en blanco entre palabras").custom(validarDobleEspacio),
    check('porcentaje', 'El porcentaje es obligatorio.').not().isEmpty(),
    check('porcentaje', 'Solo se permiten números enteros.').isInt(),
    validarCampos
], postImpuesto);

router.put('/:id', [
    check('id_usuario', 'El id es obligatorio.').not().isEmpty(),
    check('nombre', 'El nombre es obligatorio.').not().isEmpty(),
    check('nombre', 'Solo se permite texto').isAlpha('es-ES', {ignore: ' '}),
    check('nombre', 'Nombre debe estar solo en mayúscula').isUppercase(),
    check('nombre', 'Máximo de carácteres: 100').isLength({ max: 100 }),
    check("nombre", "No se permite más de un espacio en blanco entre palabras").custom(validarDobleEspacio),
    check('porcentaje', 'El porcentaje es obligatorio.').not().isEmpty(),
    check('porcentaje', 'Solo se permiten números enteros.').isInt(),
    validarCampos
], putImpuesto);

router.delete('/:id_impuesto', deleteImpuesto);

router.post('/reporteria/impuesto', getReporteImpuesto);

module.exports = router;
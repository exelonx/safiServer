const { Router } = require('express');
const { check, body } = require('express-validator');
const { getCatalogos, getCatalogo, postCatalogo, deleteCatalogo, putCatalogo } = require('../../controllers/catalogo_ventas/catalogo.controllers');
const { validarCampos } = require('../../middlewares');
const { existeCatalogo, noExisteCatalogoPorId } = require('../../middlewares/validar-catalogo-existente');


const router = Router();

router.get('/',getCatalogos);

router.get('/:id',getCatalogo);

router.post('/',[

    check('id_usuario', ' El ID es obligatorio').not().isEmpty(),
    check('nombre_catalogo', 'El Catálogo es obligatorio').not().isEmpty(),
    check('nombre_catalogo', 'Solo se permite texto').isAlpha('es-ES', {ignore: ' '}),
    check('nombre_catalogo', 'El nombre del Catálogo debe estar en mayúscula').isUppercase(),
    check('nombre_catalogo', 'Máximo de caracteres: 100').isLength({ max: 100 }),
    existeCatalogo,
    validarCampos

], postCatalogo);

router.put('/editar-catalogo/:id',[

    check('nombre_catalogo', 'El nombre del catálogo deben ser solo letras').if(body('nombre').exists()).if(body('nombre').not().equals('')).isAlpha('es-ES', {ignore: ' '}),
    check('nombre_catalogo', 'El nombre del Catálogo debe estar en mayúscula').isUppercase(),
    check('nombre_catalogo', 'Máximo de caracteres: 100').isLength({ max: 100 }),
    noExisteCatalogoPorId,
    existeCatalogo,
    validarCampos

], putCatalogo);

router.delete('/:id', [

    check('quienElimina', 'El ID es obligatorio').not().isEmpty(),
    noExisteCatalogoPorId,
    validarCampos

], deleteCatalogo)

module.exports = router
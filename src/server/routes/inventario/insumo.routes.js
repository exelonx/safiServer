const { Router } = require('express');
const { check, body } = require('express-validator');
const { getProveedores, getProveedor, postProveedor, putProveedor, deleteProveedor } = require('../../controllers/inventario/proveedores.controllers');

const { validarCampos } = require('../../middlewares');
const { validarEspaciosProveedor } = require('../../middlewares/validaciones-proveedores');
const { existeProveedor, noExisteProveedorPorId } = require('../../middlewares/validar-proveedor-existente');

const router = Router();

router.get('/', getProveedores);

module.exports = router;
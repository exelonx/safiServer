const { Router } = require('express');
const { check, body } = require('express-validator');
const { postMesaPedido, validarCaja, getMesas, getPedidosPorMesa, getDetalleDelPedido, getProductosParaAgregar, getBebidas, getMesa, postDetalle, putEstadoDetalle, deleteUnDetalle, deletePedido } = require('../../controllers/pedido/mesa.controllers');
const { validarEspacio, validarCampos, validarDobleEspacio } = require('../../middlewares');

const router = Router();

router.get('/', getMesas)

router.get('/get/:id_mesa', getMesa)

router.get('/pedido/:id_mesa', getPedidosPorMesa)

router.get('/pedido/productos/agregar', getProductosParaAgregar)

router.get('/bebida/lista', getBebidas)

router.get('/pedido/detalle/:id_pedido', getDetalleDelPedido)

router.post('/', [
    check('nombre', 'El nombre debe ir en mayúscula').isUppercase(),
    check('nombre', 'El nombre solo acepta letras').isAlpha('es-ES', {ignore: ' '}),
    check('nombre', 'Solo se permite 1 espacio entre palabras').custom(validarDobleEspacio),
    check('informacion', 'La información debe ir en mayúscula').isUppercase(),
    check('informacion', 'La información solo acepta letras y números').if(body('informacion').exists()).if(body('informacion').not().equals('')).isAlpha('es-ES', {ignore: ' 1234567890'}),
    check('informacion', 'Solo se permite 1 espacio entre palabras').custom(validarDobleEspacio),
    validarCampos
], postMesaPedido);

router.post('/detalle', postDetalle)

router.get('/validarCaja', validarCaja)

router.put('/detalle/:id_detalle', putEstadoDetalle)

router.post('/detalle/:id_detalle', deleteUnDetalle)

router.post('/pedido/:id_pedido', deletePedido)

module.exports = router;
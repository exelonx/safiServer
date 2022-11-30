const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewSar = require('../../models/facturacion/sql_views/view_sar');
const ViewPedido = require('../../models/pedido/sql-vista/view_pedido');
const ViewDetallePedido = require('../../models/pedido/sql-vista/view_detalle');
const Pedido = require('../../models/pedido/pedido');

// Llamar todas las preguntas paginadas
const getInformaciónFactura = async (req = request, res = response) => {

    let { id_pedido } = req.query

    try {

        // Traer CAI activo
        const cai = await ViewSar.findAll();

        console.log(cai.NUMERO_ACTUAL == cai.RANGO_MAXIMO)
        
        // Traer Pedido
        const pedido = await ViewPedido.findByPk(id_pedido)

        // Traer Detalle
        const detalle = await ViewDetallePedido.findAll({
            where: {
                ID_PEDIDO: id_pedido
            }
        })

        // Respuesta
        res.json( {cai, pedido, detalle} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const validarPedido = async (req = request, res = response) => {
    const { id_pedido } = req.params

    try {
        const pedido = await Pedido.findByPk(id_pedido);

        if(!pedido) {
            return res.status(400).json(false)
        }

        res.json(true)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getInformaciónFactura,
    validarPedido
}
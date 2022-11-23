const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewEstado = require('../../models/pedido/sql-vista/view_estado');
const Mesa = require('../../models/pedido/mesa');
const Pedido = require('../../models/pedido/pedido');
const Caja = require('../../models/pedido/caja')

const postMesaPedido = async (req = request, res = response) => {
    
    let { tipoPedido = "", nombre = "", id_usuario = "", informacion = "", arregloNombres = [] } = req.body

    try {

        // Verificar que haya una caja abierta
        const caja = await Caja.findOne({
            where: {
                ESTADO: true
            }
        })

        if(!caja) {
            // Respuesta
            return res.status(404).json({
                ok: false,
                msg: 'Se necesita abrir la caja'
            })
        }

        // Crear Mesa
        const mesa = await Mesa.create({
            NOMBRE: nombre,
            INFORMACION: informacion,
            TIPO: tipoPedido
        })

        if(arregloNombres.length > 0) {
            for await(nombre of arregloNombres) {
                await Pedido.create({
                    ID_USUARIO: id_usuario,
                    ID_MESA: mesa.id,
                    ID_CAJA: 1,
                    NOMBRE_CLIENTE: nombre,
                    MODIFICADO_POR: id_usuario
                })
            }
        }
        

        // Respuesta
        res.json({
            ok: true, 
            msg: 'Pedido '+ nombre.toLowerCase() +' creado'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const validarCaja = async (req = request, res = response) => { 

    try {
        const caja = await Caja.findOne({
            where: {
                ESTADO: true
            }
        })

        if(!caja) {
            // Respuesta
            return res.status(404).json(false)
        }

        return res.json(true)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    postMesaPedido,
    validarCaja
}
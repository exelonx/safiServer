const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const { eventBitacora } = require('../../helpers/event-bitacora');
const TipoPago = require('../../models/facturacion/tipo_pago');

const getTipoPagos = async (req = request, res = response) => {
    let { limite = 10, desde = 0, buscar = "", id_usuario = "" } = req.query

    try {

        // Definir el número de objetos a mostrar
        if (!limite || limite === "") {
            const { VALOR } = await Parametro.findOne({ where: { PARAMETRO: 'ADMIN_NUM_REGISTROS' } })
            limite = VALOR;
        }

        if (desde === "") {
            desde = 0;
        }

        // Paginación
        const tipoPago = await TipoPago.findAll(
            );

        

        // Guardar evento
        // if (buscar !== "" && desde == 0) {
        //     eventBitacora(new Date, id_usuario, 23, 'CONSULTA', `SE BUSCÓ LA COMPRA CON EL TÉRMINO '${buscar}'`);
        // }

        // Respuesta
        res.json({ tipoPago })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    } 
}

const getTipoPago = async (req = request, res = response) => {
    
    const { id } = req.params
    
    try {
        const tipoPago = await TipoPago.findByPk( id );

        // Validar Existencia
        if( !tipoPago ){
            return res.status(404).json({
                msg: 'No existe un tipo de pago con el id ' + id
            })
        }

        res.json({ tipoPago })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getTipoPagos,
    getTipoPago
}
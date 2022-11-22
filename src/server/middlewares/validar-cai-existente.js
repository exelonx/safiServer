const { response, request } = require("express");
const { Op } = require("sequelize");
const Sar = require("../models/facturacion/sar");

const existeCAI = async(req = request, res = response, next) => {

    const { cai } = req.body;
    // Validar que no exista cai repetido
    const caiRepetido = await Sar.findOne({
        where: {
            CAI: cai
        }
    })

    if ( caiRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El CAI: ${ cai }, ya existe`
        }) 
    }

    next()
}

const existeCaiPut = async(req = request, res = response, next) => {

    const { id } = req.params
    const { cai } = req.body;
    // Validar que no exista el CAI repetido
    const CAIRepetido = await Sar.findOne({
        where: {
            CAI: cai,
            [Op.not] : [
                {ID: id}
            ]
        }
    })

    if ( CAIRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El CAI: ${ cai }, ya existe`
        }) 
    }

    next()
}

const noExisteCAIPorId = async(req = request, res = response, next) => {

    const { id } = req.params;
    // Validar que no exista rol repetido
    const caiNoExistente = await Sar.findByPk( id )

    if ( !caiNoExistente ) {
        return res.status(400).json({
            ok: false,
            msg: `El CAI: ${ id }, no existe`
        }) 
    }

    next()

}

module.exports = {
    existeCAI,
    existeCaiPut,
    noExisteCAIPorId
}
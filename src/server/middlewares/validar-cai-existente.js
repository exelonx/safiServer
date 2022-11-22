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

const existeRangoMinimo = async(req = request, res = response, next) => {

    const { rango_minimo } = req.body;
    // Validar que no exista rango mínimo repetido
    const rangoMinimoRepetido = await Sar.findOne({
        where: {
            RANGO_MINIMO: rango_minimo
        }
    })

    if ( rangoMinimoRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El rango mínimo: ${ rango_minimo }, ya existe`
        }) 
    }

    next()
}

const existeRangoMaximo = async(req = request, res = response, next) => {

    const { rango_maximo } = req.body;
    // Validar que no exista rango máximo repetido
    const rangoMaximoRepetido = await Sar.findOne({
        where: {
            RANGO_MAXIMO: rango_maximo
        }
    })

    if ( rangoMaximoRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El rango máximo: ${ rango_maximo }, ya existe`
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
    existeRangoMinimo,
    existeRangoMaximo,
    noExisteCAIPorId
}
const { response, request } = require("express");
const Sar = require("../models/facturacion/sar");

const noExisteCAI = async( req = request, res = response, next ) => {

    const { id } = req.body;

    // Verificar el usuario
    let cai = await Sar.findByPk( id );

    if ( !cai ) {
        return res.status(400).json({
            ok: false,
            msg: 'No existe un CAI con el ID: '+id
        })
    }

    next()
}

const validarEspaciosCAI = ( req = request, res = response, next ) => {

    const { cai = "" } = req.body;

    if ( cai.includes(' ') ) {
        return res.status(400).json({
            ok: false,
            msg: 'No se permiten espacios.'
        })
    }

    next()
}

module.exports = {
    noExisteCAI,
    validarEspaciosCAI
}
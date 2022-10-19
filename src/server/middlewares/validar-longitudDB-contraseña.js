const { Op } = require("sequelize");
const { response, request } = require("express");

const Parametro = require("../models/seguridad/parametro");

const validarLongitudDBContra = async(req = request, res = response, next) => {

    const maximo = await Parametro.findOne({where: {PARAMETRO: 'MAX_CONTRASENA'}})
    const minimo = await Parametro.findOne({where: {PARAMETRO: 'MIN_CONTRASENA'}})

    // data del body 
    let { contrasena = "" } = req.body;

    if(!contrasena) {
        contrasena = ""
    }

    // Validar que la contraseña no sea
    if ( maximo.VALOR < contrasena.length ) {
        return res.status(400).json({
            ok: false,
            msg: `Número de carácteres máximos en la contraseña: ${maximo.VALOR}`
        })
    }

    if ( minimo.VALOR > contrasena.length ) {
        return res.status(400).json({
            ok: false,
            msg: `Número de carácteres mínimo en la contraseña: ${minimo.VALOR}`
        })
    }

    //TODO OK!
    next();

}

module.exports = {
    validarLongitudDBContra
}
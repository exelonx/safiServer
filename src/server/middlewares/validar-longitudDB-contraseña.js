const { Op } = require("sequelize");
const { response, request } = require("express");

const Parametro = require("../models/seguridad/parametro");

const validarLongitudDBContra = async(req = request, res = response, next) => {

    const parametros = await Parametro.findAll({
        where: {
            [Op.or]: [
                { PARAMETRO: 'MAX_CONTRASEÑA' },
                { PARAMETRO: 'MIN_CONTRASEÑA' }
            ]
        }
    })

    // data del body 
    const { contraseña } = req.body;

    // Asignar datos para facilitar lectura
    let maximo, minimo = "";
    if ( parametros[0].PARAMETRO = 'MAX_CONTRASEÑA' ) {
        maximo = parametros[0].VALOR;
        minimo = parametros[1].VALOR;
    } else {    // parametros[1] es MAX_CONTRASEÑA
        maximo = parametros[1].VALOR;
        minimo = parametros[0].VALOR;
    }

    // Validar que la contraseña no sea
    if ( maximo < contraseña.length ) {
        return res.status(400).json({
            ok: false,
            msg: `Número de carácteres máximos en la contraseña: ${maximo}`
        })
    }

    if ( minimo > contraseña.length ) {
        return res.status(400).json({
            ok: false,
            msg: `Número de carácteres mínimo en la contraseña: ${minimo}`
        })
    }

    //TODO OK!
    next();

}

module.exports = {
    validarLongitudDBContra
}
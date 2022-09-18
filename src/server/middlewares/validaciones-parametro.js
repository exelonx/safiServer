const Parametro = require("../models/seguridad/parametro");

const { response, request } = require("express");

const validarCamposYExistenciaParametros = async(req = request, res = response, next) => {

    const { id_parametro } = req.params;
    const { valor } = req.body;

    // Validar que exista la respuesta
    const parametro = await Parametro.findByPk( id_parametro )

    if ( !parametro ) {
        throw new Error(`El parametro con id ${ id } no existe`);
    }


    // Validar que la máximo de contraseña no sea inferior al mínimo
    if ( respuesta.PARAMETRO == 'MAX_CONTRASEÑA') {
        const minContraseña = await Parametro.findOne({ where: {PARAMETRO: 'MIN_CONTRASEÑA'}})
        if ( valor < minContraseña.VALOR ) {
            return res.status(400).json({
                msg: 'Debe ingresar un valor mayor a la contraseña mínima'
            })
        }
    }

    // Validar que el mínimo de la contraseña no sea superior al máximo
    if ( respuesta.PARAMETRO == 'MIN_CONTRASEÑA') {
        const maxContraseña = await Parametro.findOne({ where: {PARAMETRO: 'MAX_CONTRASEÑA'}})
        if ( valor > maxContraseña.VALOR ) {
            return res.status(400).json({
                msg: 'Debe ingresar un valor menor a la contraseña máxima'
            })
        }
    }

    //TODO OK!
    next();

}

module.exports = {
    validarCamposYExistenciaParametros
}

const { response } = require("express");
const PreguntaUsuario = require("../models/seguridad/pregunta-usuario");

const noExisteRespuesta = async( id, res = response ) => {

    // Validar que exista la respuesta
    const respuesta = await PreguntaUsuario.findByPk( id )

    if ( !respuesta ) {
        return res.status(400).json({
            ok: false,
            msg: `La respuesta con id ${ id }, no existe`
        })
    }

}

module.exports = {
    noExisteRespuesta
}
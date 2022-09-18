
const PreguntaUsuario = require("../models/seguridad/pregunta-usuario");

const noExisteRespuesta = async( id ) => {

    // Validar que exista la respuesta
    const respuesta = await PreguntaUsuario.findByPk( id )

    if ( !respuesta ) {
        throw new Error(`La respuesta con id ${ id }, no existe`);
    }

}

module.exports = {
    noExisteRespuesta
}
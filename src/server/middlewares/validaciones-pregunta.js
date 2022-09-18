const Preguntas = require("../models/seguridad/Pregunta");

const noExistePregunta = async( pregunta_id ) => {

    // Validar que exista la pregunta
    const pregunta = await Preguntas.findByPk( pregunta_id )

    if ( !pregunta ) {
        throw new Error(`La pregunta con id ${ pregunta_id }, no existe`);
    }

}

module.exports = {
    noExistePregunta
}
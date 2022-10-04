const Preguntas = require("../models/seguridad/Pregunta");

const noExistePregunta = async( pregunta_id ) => {

    // Validar que exista la pregunta
    const pregunta = await Preguntas.findByPk( pregunta_id )

    if ( !pregunta ) {
        throw new Error(`La pregunta con id ${ pregunta_id }, no existe`);
    }

}

const noEsPregunta = async (pregunta = '') =>{
    if(pregunta.charAt(0) !== '¿'){
        throw new Error(`${ pregunta }, hace falta el signo ¿`);
    }

    if(pregunta.charAt(pregunta.length - 1) !== '?'){
        throw new Error(`${ pregunta }, hace falta el signo ?`);
    }
}

module.exports = {
    noExistePregunta,
    noEsPregunta
}
const { response } = require("express");

const Preguntas = require("../models/seguridad/Pregunta");

const noExistePregunta = async( pregunta_id, res = response) => {

    // Validar que exista la pregunta
    const pregunta = await Preguntas.findByPk( pregunta_id )

    if ( !pregunta ) {
        throw new Error(`La pregunta con id ${ pregunta_id }, no existe`);
    }

}

const noEsPregunta = async (pregunta = '') =>{
    if(pregunta.charAt(0) !== '¿' && pregunta.charAt(pregunta.length - 1) !== '?'){
        throw new Error(`La pregunta debe llevar signos de interrogación`);
       
    }

    if(pregunta.charAt(0) !== '¿'){
        throw new Error(`Hace falta el signo '¿'`);
       
    }

    if(pregunta.charAt(pregunta.length - 1) !== '?'){
        throw new Error(`Hace falta el signo '?'`);
       
    }

    console.log(pregunta.substring(1, pregunta.length))

    if(pregunta.substring(1, pregunta.length - 1).includes('?') || pregunta.substring(1, pregunta.length - 1).includes('¿') ){
        throw new Error(`No se permiten caracteres especiales`);
    }
    
    if(pregunta.includes('  ')){
        throw new Error(`No se permite más de un espacio en blanco entre palabras`);
    }
    
}

module.exports = {
    noExistePregunta,
    noEsPregunta
}
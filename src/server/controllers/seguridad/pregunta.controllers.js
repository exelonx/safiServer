const { request, response } = require('express');
const { Op } = require('sequelize');
const Pregunta = require('../../models/seguridad/Pregunta');

// Llamar todas las preguntas paginadas
const getPreguntas = async (req = request, res = response) => {
    
    let { limite = 10, desde = 0 } = req.query

    try {

        // Paginación
        const preguntas = await Pregunta.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10)
        });
        
        // Contar resultados total
        const countPregunta = await Pregunta.count()

        // Respuesta
        res.json( { preguntas, countPregunta} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 sola pregunta
const getPregunta = async (req = request, res = response) => {
     
    const { id_pregunta } = req.params

    try {
        
        const pregunta = await Pregunta.findByPk( id_pregunta );

        // Validar Existencia
        if( !pregunta ){
            return res.status(404).json({
                msg: 'No existe una pregunta con el id ' + id_pregunta
            })
        }

        res.json( pregunta )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const postPregunta = async (req = request, res = response) => {
    //body
    const { pregunta } = req.body;
    
    try {

        // Construir modelo
        const nuevaPregunta = await Pregunta.build({
            PREGUNTA: pregunta
        });

        // Insertar a DB
        await nuevaPregunta.save();   

        // Responder
        res.json( nuevaPregunta );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putPregunta = async (req = request, res = response) => {
    const { id_pregunta } = req.params
    const { pregunta } = req.body;

    try {

        // Actualizar db Pregunta
        await Pregunta.update({
            PREGUNTA: pregunta
        }, {
            where: {
                ID_PREGUNTA: id_pregunta
            }
        })

        res.json({ id_pregunta, pregunta });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const deletePregunta = async (req = request, res = response) => {
    const { id_pregunta } = req.params

    try {

        // Llamar la pregunta a borrar
        const pregunta = await Pregunta.findByPk( id_pregunta );

        // Extraer la descripcion de la pregunta
        const { PREGUNTA } = pregunta;

        // Borrar Rol
        await pregunta.destroy();

        res.json({
            msg: `La pregunta: "${PREGUNTA}" ha sido eliminado`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }  
}

module.exports = {
    getPreguntas,
    getPregunta,
    postPregunta,
    putPregunta,
    deletePregunta
}

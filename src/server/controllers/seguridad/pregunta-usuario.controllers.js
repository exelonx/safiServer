const { request, response } = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const Pregunta = require('../../models/seguridad/Pregunta');
const PreguntaUsuario = require('../../models/seguridad/pregunta-usuario');
const ViewPreguntaUsuario = require('../../models/seguridad/sql-vistas/view-pregunta-usuario');

// Llamar todas las preguntas de los usuarios paginadas
const getPreguntasAllUsuarios = async (req = request, res = response) => {
    
    const { buscar = "" } = req.body;
    let { limite = 10, desde = 0 } = req.query

    try {

        // Paginación
        const preguntas = await ViewPreguntaUsuario.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                // WHERE PREGUNTA LIKE %${BUSCAR}% OR LIKE %${BUSCAR}%
                [Op.or]: [{
                    PREGUNTA: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });
        
        // Contar resultados total
        const countPregunta = await ViewPreguntaUsuario.count()

        // Respuesta
        res.json( { preguntas, countPregunta} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 sola pregunta de usuario
const getPregunta = async (req = request, res = response) => {
     
    const { id_pregunta } = req.params

    try {
        
        const pregunta = await ViewPreguntaUsuario.findByPk( id_pregunta );

        // Validar Existencia
        if( !pregunta ){
            return res.status(404).json({
                msg: 'No existe una pregunta de usuario con el id ' + id_pregunta
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

const postRespuesta = async (req = request, res = response) => {
    //body
    const { id_usuario, id_pregunta, respuesta } = req.body;
    
    try {

        // Construir modelo
        const nuevaRespuesta = await PreguntaUsuario.build({
            ID_USUARIO: id_usuario,
            ID_PREGUNTA: id_pregunta,
            RESPUESTA: respuesta
        });

        // Hashear respuesta
        const salt = bcrypt.genSaltSync();
        nuevaRespuesta.RESPUESTA = bcrypt.hashSync(respuesta, salt);

        // Insertar a DB
        await nuevaRespuesta.save();   

        // Responder
        res.json( nuevaRespuesta );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putRespuesta = async (req = request, res = response) => {

    const { id_respuesta } = req.params
    const { id_pregunta, respuesta } = req.body;

    try {

        // Hashear respuesta
        const salt = bcrypt.genSaltSync();
        const respuestaHasheada = bcrypt.hashSync(respuesta, salt);

        // Actualizar db Pregunta
        await PreguntaUsuario.update({
            ID_PREGUNTA: id_pregunta,
            RESPUESTA: respuestaHasheada
        }, {
            where: {
                ID: id_respuesta
            }
        })

        res.json({ id_respuesta, id_pregunta, respuestaHasheada });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getPreguntasAllUsuarios,
    getPregunta,
    postRespuesta,
    putRespuesta,
}

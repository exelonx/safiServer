const { request, response } = require('express');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const PreguntaUsuario = require('../../models/seguridad/pregunta-usuario');
const ViewPreguntaUsuario = require('../../models/seguridad/sql-vistas/view-pregunta-usuario');
const Usuarios = require('../../models/seguridad/Usuario');
const Parametros = require('../../models/seguridad/Parametro');
const { red } = require('colors');
const { eventBitacora } = require('../../helpers/event-bitacora');


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

// Para todas las pregunta de un usuario
const getPreguntasUsuario = async (req = request, res = response) => {
     
    const { id_usuario } = req.params

    try {
        
        const preguntas = await ViewPreguntaUsuario.findAll({
            where: {
                ID_USUARIO: id_usuario
            }
        });

        // Validar Existencia
        if( !preguntas ){
            return res.status(404).json({
                msg: 'El usuario no tiene configurada las preguntas de seguridad'
            })
        }

        const preguntasMapped = preguntas.map( pregunta => {
 
             return {
                id: pregunta.ID,
                pregunta: pregunta.PREGUNTA
             }

        })

        res.json( preguntasMapped )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

// Api solo para la pantalla de configurar preguntas
const getPreguntasFaltantes = async (req = request, res = response) => {
    
    const { id_usuario } = req.params;

    try {
        // traer el número de preguntas configuradas
        const preguntasUsuario = await PreguntaUsuario.count({where: {
            ID_USUARIO: id_usuario
        }});

        // Traer el número requeridas de pregutas por el sistema
        const preguntasRequeridas = await Parametros.findOne({where:{PARAMETRO:'ADMIN_PREGUNTAS'}});

        // Calcular preguntas faltantes y enviarlas
        const faltantes = parseInt(preguntasRequeridas.VALOR) - parseInt(preguntasUsuario)

        // Responder
        res.json({
            ok: true,
            msg: faltantes
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const compararPregunta = async (req = request, res = response) => { 

    const { id, id_usuario, respuesta } = req.body;

    try {

        // Buscar la pregunta del usuario
        const pregunta = await PreguntaUsuario.findOne({where: {
            ID_PREGUNTA: id,
            ID_USUARIO: id_usuario
        }});

        // Validar Existencia de la pregunta
        if( !pregunta ) {

            // Bloquear usuario
            const usuario = await Usuarios.findByPk(id_usuario);
            let msgBloqueo = '';

            // Validar si ya esta bloqueado
            if( usuario.ESTADO_USUARIO !== 'BLOQUEADO') {

                msgBloqueo = ' Usuario bloqueado'
                usuario.ESTADO_USUARIO = 'BLOQUEADO';
                usuario.save(); // Guardar cambios

            }

            eventBitacora(new Date, id_usuario, 6, 'ACTUALIZACION', `INTENTO FALLIDO CONTESTANDO PREGUNTA SECRETA. ${msgBloqueo.toUpperCase()}`);

            // Respuesta
            return res.status(401).json({
                ok: false,
                msg: 'Respuesta incorrecta.' + msgBloqueo
            });
        }

        // Confirmar si la respuesta hace match
        const validarRespuesta = await bcrypt.compareSync( respuesta, pregunta.RESPUESTA )
        if( !validarRespuesta ) {

            // Bloquear usuario
            const usuario = await Usuarios.findByPk(pregunta.ID_USUARIO);
            let msgBloqueo = '';

            // Validar si ya esta bloqueado
            if( usuario.ESTADO_USUARIO !== 'BLOQUEADO') {

                msgBloqueo = ' Usuario bloqueado'
                usuario.ESTADO_USUARIO = 'BLOQUEADO';
                usuario.save(); // Guardar cambios

            }

            eventBitacora(new Date, id_usuario, 6, 'ACTUALIZACION', `INTENTO FALLIDO CONTESTANDO PREGUNTA SECRETA. ${msgBloqueo.toUpperCase()}`);

            // Respuesta
            return res.status(401).json({
                ok: false,
                msg: 'Respuesta incorrecta.' + msgBloqueo
            });
        }

        // Responder éxito
        const usuario = await Usuarios.findByPk(pregunta.ID_USUARIO);
        usuario.PREGUNTAS_CONTESTADAS++
        usuario.save()
        return res.json({
            ok: true
        });

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

const postMultiplesRespuestas = async (req = request, res = response) => {
    const { arregloRespuestas } = req.body
    let error = false;    // Para evitar crasheo del servidor
    let indice = 0;
    try {

        // Hashear respuesta
        const salt = bcrypt.genSaltSync();

        // Validar que sea un arreglo válido
        arregloRespuestas.forEach((respuesta, i) => {
            if(!(respuesta.ID_USUARIO && respuesta.RESPUESTA && respuesta.ID_PREGUNTA)){
                // Respuesta
                error = true
                indice = i;
                return // Salir del bucle
            }
            respuesta.RESPUESTA = bcrypt.hashSync(respuesta.RESPUESTA, salt);   // Encriptar respuesta
        });

        // Lanzar error
        if( error ) {
            return res.status(400).json({
                ok: false,
                msg: 'Se esperaba un arreglo de preguntas de usuario válido, error en el índice: '+indice
            });
        }

        // Insertar en la base de datos
        await PreguntaUsuario.bulkCreate(arregloRespuestas);

        // Respuesta éxitosa
        res.json({
            ok: true,
            msg: '¡Preguntas configuradas con éxito!'
        })
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
    getPreguntasUsuario,
    getPreguntasFaltantes,
    compararPregunta,
    postRespuesta,
    postMultiplesRespuestas,
    putRespuesta,
}

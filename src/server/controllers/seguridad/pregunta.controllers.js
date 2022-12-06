const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require("sequelize");
const { eventBitacora } = require('../../helpers/event-bitacora');
const Parametro = require('../../models/seguridad/parametro');

const Pregunta = require('../../models/seguridad/pregunta');

// Llamar todas las preguntas paginadas
const getPreguntas = async (req = request, res = response) => {

    let { limite , desde = 0, buscar = "", id_usuario } = req.query;

    try {
        // Definir el número de objetos a mostrar
        if(!limite || limite === "") {
            const { VALOR } = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
            limite = VALOR
        }

        if(desde === "") {
            desde = 0
        }

        // Paginación
        const preguntas = await Pregunta.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    PREGUNTA: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }]
            }
        });
        
        // Contar resultados total
        const countPregunta = await Pregunta.count({
            where: {
                [Op.or]: [{
                    PREGUNTA: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }]
            }
        })

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, id_usuario, 5, 'CONSULTA', `SE BUSCO LA PREGUNTA CON EL TERMINO ${buscar}`);
        }

        // Respuesta
        res.json( { preguntas, countPregunta, limite } )

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
        res.json({
            ok: true,
            msg: 'Pregunta creada correctamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putPregunta = async (req = request, res = response) => {
    const { id_pregunta } = req.params
    const { pregunta, id_usuario = "" } = req.body;

    try {

        const preguntaAnterior = await Pregunta.findByPk(id_pregunta)

        // Actualizar db Pregunta
        await Pregunta.update({
            
            PREGUNTA: pregunta
        }, {
            where: {
                ID_PREGUNTA: id_pregunta
            }
        })

         // Si llega sin cambios
         if(!(pregunta.PREGUNTA == pregunta || pregunta === "")) { 
            eventBitacora(new Date, id_usuario, 5, 'ACTUALIZACION', `LA PREGUNTA '${preguntaAnterior.PREGUNTA}' HA SIDO ACTUALIZADA CON ÉXITO`);
        }


        res.json({ 
            ok: true, 
            msg: 'Pregunta actualizada con éxito'});

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
    
}

const deletePregunta = async (req = request, res = response) => {
    const { id_pregunta } = req.params
    const { quienElimina } = req.query;

    try {

        const preguntaAnterior = await Pregunta.findByPk(id_pregunta);

        // Llamar la pregunta a borrar
        const pregunta = await Pregunta.findByPk( id_pregunta );

        // Extraer la descripcion de la pregunta
        const { PREGUNTA } = pregunta;

        await pregunta.destroy();
        

         // Si llega sin cambios
         if(!(pregunta.PREGUNTA == pregunta || pregunta === "")) { 
            eventBitacora(new Date, quienElimina, 5, 'ELIMINACIÓN', `LA PREGUNTA '${preguntaAnterior.PREGUNTA}' HA SIDO ELIMINADA CON ÉXITO`);
        }

        res.json({
            ok: true, 
            msg: `La pregunta: "${PREGUNTA}" ha sido eliminada`
        });

    } catch (error) {
        
        if (error instanceof ForeignKeyConstraintError) {
            res.status(403).json({
              ok: false,
              msg: `La pregunta no puede ser eliminada porque está en uso`,
            });
          } else {
            console.log(error);
            res.status(500).json({
              msg: error.message,
            });
          }
    }  
}

module.exports = {
    getPreguntas,
    getPregunta,
    postPregunta,
    putPregunta,
    deletePregunta
}

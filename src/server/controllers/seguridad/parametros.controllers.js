const { request, response } = require('express');
const { Op } = require('sequelize');

const { eventBitacora } = require('../../helpers/event-bitacora');

const Parametro = require('../../models/seguridad/parametro');
const ViewParametro = require('../../models/seguridad/sql-vistas/view-parametro');
const Usuarios = require('../../models/seguridad/Usuario');

// Llamar todas los parametros
const getParametros = async (req = request, res = response) => {
    let { limite, desde = 0, buscar = "", id_usuario } = req.query

    try {

        // Definir el número de objetos a mostrar
        if(!limite || limite === "") {
            const { VALOR } = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
            limite = VALOR
        }

        if(desde === "") {
            desde = 0
        }

        const parametros = await ViewParametro.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
                [Op.or]: [{
                    PARAMETRO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    VALOR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });

        const countParametro = await ViewParametro.count({where: {
            // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
            [Op.or]: [{
                PARAMETRO: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                VALOR: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }]
        }})

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, id_usuario, 10, 'CONSULTA', `SE BUSCO LOS PARAMETRO CON EL TERMINO '${buscar}'`);
        }

        // Respuesta
        res.json( {limite, countParametro, parametros} );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo parametro
const getParametro = async (req = request, res = response) => {
     
    const { id_parametro } = req.params

    try {
        
        const parametro = await Parametro.findByPk( id_parametro );

        // Validar Existencia
        if( !parametro ){
            return res.status(404).json({
                msg: 'No existe un parametro con el id ' + id_parametro
            })
        }

        res.json( parametro )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const putParametro = async (req = request, res = response) => {

    const { id_parametro } = req.params
    const { valor, id_usuario } = req.body;

    try {

        const parametro = await Parametro.findByPk( id_parametro )

        // Si no hay modificaciones
        if(!(parametro.VALOR == valor || valor === "")) {

            // Guardar evento
            eventBitacora(new Date, id_usuario, 10, 'ACTUALIZACION', `SE ACTUALIZO EL PARAMETRO: ${parametro.PARAMETRO}`);

        }

        // Actualizar db Parametro
        await Parametro.update({
            MODIFICADO_POR: id_usuario,
            VALOR: valor
        }, {
            where: {
                ID_PARAMETRO: id_parametro
            }
        })

        res.json({ 
            ok: true,
            msg: `¡Parametro ${parametro.PARAMETRO} actualizado con éxito!`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const postParametro = async (req = request, res = response) => { 
    const { parametro, valor, id_quienCreo } = req.body;

    try {

        if(parametro.includes(' ')) {
            return res.status(400).json({
                ok: false,
                msg: 'No se permite espacio blanco en los parámetros, usar "_" para separar las palabras'
            })
        }

        const nuevoParametro = await Parametro.build({
            PARAMETRO: parametro,
            VALOR: valor,
            CREADO_POR: id_quienCreo,
            MODIFICADO_POR: id_quienCreo
        })

        // Guardar en BD
        await nuevoParametro.save()
            .then( resp => {
                // Guardar evento
                eventBitacora(new Date, id_quienCreo, 10, 'NUEVO', `PARAMETRO ${parametro.toUpperCase()} CREADO`);

                return res.json({ 
                    ok: true,
                    msg: `Parametro ${parametro} creado con éxito`
                });
            })
            .catch( err => {
                // Error de campo unico
                if( err.errors[0].type === 'unique violation' ) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Ya existe un parametro con el nombre '+parametro
                    })
                }
            });   
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const deleteParametro = async (req = request, res = response) => {

    const { id_parametro } = req.params
    const { id_quienElimino } = req.query

    try {

        const parametro = await Parametro.findByPk( id_parametro )
        const usuario = await Usuarios.findByPk( id_quienElimino )
        
        if(!usuario) {

            return res.status(404).json({
                ok: false,
                msg: 'No se encuentra el usuario con el id: '+id_quienElimino
            })

        }
        
        // Si no hay modificaciones
        if(!parametro) {
            
            return res.status(404).json({
                ok: false,
                msg: 'No se encuentra el parámetro con el id: '+id_parametro
            })
            
        }
        
        let nombre_parametro = parametro.PARAMETRO;

        parametro.destroy();
        // Guardar evento
        eventBitacora(new Date, id_quienElimino, 10, 'ELIMINACIÓN', `SE ELIMINÓ EL PARAMETRO: ${nombre_parametro}`);

        return res.json({ 
            ok: true,
            msg: `Parametro ${nombre_parametro} ha sido eliminado del sistema`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getParametros,
    getParametro,
    putParametro,
    deleteParametro,
    postParametro
}

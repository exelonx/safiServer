const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewEstado = require('../../models/pedido/sql-vista/view_estado');
const Estado = require('../../models/pedido/estado');

const getEstados = async (req = request, res = response) => {
    
    let { limite, desde = 0, buscar = "", quienBusco = "" } = req.query

    try {

        // Definir el número de objetos a mostrar
        if(!limite || limite === ""){
            const { VALOR } = await Parametro.findOne({where: {PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
            limite = VALOR;
        }

        if(desde === ""){
            desde = 0;
        }

        // Paginación
        const estados = await ViewEstado.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    ESTADO: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Contar resultados total
        const countEstados = await ViewEstado.count({where: {
                [Op.or]: [{
                    ESTADO: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 24, 'CONSULTA', `SE BUSCÓ EL ESTADO CON EL TÉRMINO: '${buscar}'`);
        }

        // Respuesta
        res.json( {limite, countEstados, estados} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const getEstado = async (req = request, res = response) => {
     
    const { id } = req.params

    try {
        
        const estado = await ViewEstado.findByPk( id );

        // Validar Existencia
        if( !estado ){
            return res.status(404).json({
                msg: 'No existe un estado con el id ' + id
            })
        }

        res.json({ estado })

    } 
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const postEstado = async (req = request, res = response) => {
    //body
    const { estado = "", color = "", id_usuario = "" } = req.body;
    
    try {
 
        // Construir modelo
        const nuevoEstado = await Estado.create({
            ESTADO: estado,
            COLOR: color,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        });
 
        // Guardar evento
        eventBitacora(new Date, id_usuario, 25, 'NUEVO', `SE CREÓ UN ESTADO  ${nuevoEstado.ESTADO}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Estado '+ estado + ' ha sido creado con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putEstado = async (req = request, res = response) => {
    const { id } = req.params
    const { estado = "", color = "", id_usuario } = req.body;

    try {

        const estado = await Estado.findByPk(id);
        
        // Si llega sin cambios
        if(!((estado.ESTADO == estado || estado === ""))) {

            eventBitacora(new Date, id_usuario, 25, 'ACTUALIZACION', `IMPUESTO ${estado.ESTADO}, ACTUALIZADO A : ${estado !== "" && estado.ESTADO != estado ? `${estado}` : ""}`);

        }

        // Actualizar db Catálogo
        await Estado.update({
            ESTADO: estado !== "" ? estado : Estado.ESTADO,
            COLOR: color !== "" ? estado : Estado.ESTADO,
        }, {
            where: {
                id: id
            }
        })

        res.json({
            ok: true,
            msg: 'Estado: '+ estado.ESTADO + ' ha sido actualizado con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const deleteEstado = async (req = request, res = response) => {
    const { id_estado } = req.params
    const { quienElimina } = req.query

    try {

        // Llamar el catálogo a borrar
        const estado = await Estado.findByPk( id_estado );

        if (!estado) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe el estado'
            })
        }
        // Extraer el nombre del catálogo
        const { ESTADO } = estado;

        // Borrar catalogo
        await estado.destroy();

        // Guardar evento
        eventBitacora(new Date, quienElimina, 24, 'BORRADO', `SE ELIMINÓ EL ESTADO ${ESTADO}`);

        res.json({
            ok: true,
            msg: `El estado: ${ESTADO} ha sido eliminado`
        });

    } catch (error) {
        if( error instanceof ForeignKeyConstraintError ) {
            res.status(403).json({
                ok: false,
                msg: `El estado no puede ser eliminado`
            })
        } else {

            console.log(error);
            res.status(500).json({
                msg: error.message
            })

        }
    }  
}

module.exports = {
    getEstados,
    getEstado,
    postEstado,
    putEstado,
    deleteEstado
}
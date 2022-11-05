const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const Producto = require('../../models/catalogo-ventas/producto');
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewProducto = require('../../models/catalogo-ventas/sql-vistas/view_producto');

// Llamar todas las preguntas paginadas
const getProductos = async (req = request, res = response) => {

    let { limite, desde = 0, buscar = "", quienBusco = "" } = req.query

    try {

        // Definir el número de objetos a mostrar
        if (!limite || limite === "") {
            const { VALOR } = await Parametro.findOne({ where: { PARAMETRO: 'ADMIN_NUM_REGISTROS' } })
            limite = VALOR;
        }

        if (desde === "") {
            desde = 0;
        }

        // Paginación
        const productos = await ViewProducto.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [
                    {
                        PORCENTAJE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        TIPO_PRODUCTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        PRECIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        FECHA_INICIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        FECHA_FINAL: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    }
                ]
            }
        });

        // Contar resultados total
        const countProducto = await ViewProducto.count({
            where: {
                [Op.or]: [{
                    PORCENTAJE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    TIPO_PRODUCTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    PRECIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    FECHA_INICIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    FECHA_FINAL: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Guardar evento
        if (buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 18, 'CONSULTA', `SE BUSCÓ EL PRODUCTO CON EL TÉRMINO: '${buscar}'`);
        }

        // Respuesta
        res.json({ limite, countProducto, productos })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo Proveedor
/* const getUnidad = async (req = request, res = response) => {
     
    const { id } = req.params

    try {
        
        const unidad = await Unidad.findByPk( id );

        // Validar Existencia
        if( !unidad ){
            return res.status(404).json({
                msg: 'No existe una unidad con el id ' + id
            })
        }

        res.json({ unidad })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

} */

/* const postUnidad = async (req = request, res = response) => {
    //body
    const { unidad_medida = "", id_usuario } = req.body;
    
    try {
 
        // Construir modelo
        const nuevaUnidad = await Unidad.build({
            UNIDAD_MEDIDA: unidad_medida,
        });
        // Insertar a DB
        await nuevaUnidad.save();   
        
        // Guardar evento
        eventBitacora(new Date, id_usuario, 16, 'NUEVO', `SE CREO UNA NUEVA UNIDAD ${nuevaUnidad.UNIDAD_MEDIDA}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Unidad: '+ unidad_medida + ' ha sido creada con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
} */

/* const putUnidad = async (req = request, res = response) => {
    const { id } = req.params
    const { unidad_medida = "", id_usuario = "" } = req.body;

    try {

        const unidad = await Unidad.findByPk(id);
        
        // Si llega sin cambios
        if(!((unidad.UNIDAD_MEDIDA == unidad_medida || unidad_medida === ""))) {

                eventBitacora(new Date, id_usuario, 16, 'ACTUALIZACION', `DATOS ACTUALIZADOS: ${unidad_medida !== "" ? 'UNIDAD_MEDIDA' : ""}`);

        }

        // Actualizar db Rol
        await Unidad.update({
            UNIDAD_MEDIDA: unidad_medida !== "" ? unidad_medida : Unidad.UNIDAD_MEDIDA,
        }, {
            where: {
                ID: id
            }
        })

        res.json({
            ok: true,
            msg: 'Unidad: '+ unidad.UNIDAD_MEDIDA + ' ha sido actualizada con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
} */

/* const deleteUnidad = async (req = request, res = response) => {
    const { id } = req.params
    const { quienElimina } = req.body

    try {

        // Llamar el proveedor a borrar
        const unidad = await Unidad.findByPk( id );

        // Extraer el nombre de la unidad
        const { UNIDAD_MEDIDA } = unidad;

        // Borrar unidad
        await unidad.destroy();

        // Guardar evento
        eventBitacora(new Date, quienElimina, 16, 'BORRADO', `SE ELIMINO LA UNIDAD ${UNIDAD_MEDIDA}`);

        res.json({
            ok: true,
            msg: `La unidad: ${UNIDAD_MEDIDA} ha sido eliminado`
        });

    } catch (error) {
        if( error instanceof ForeignKeyConstraintError ) {
            res.status(403).json({
                ok: false,
                msg: `La unidad de medida no puede ser eliminada`
            })
        } else {

            console.log(error);
            res.status(500).json({
                msg: error.message
            })

        }
    }  
} */

module.exports = {
    getProductos
    /*  getUnidad,
     postUnidad,
     putUnidad,
     deleteUnidad */
}
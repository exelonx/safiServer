const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const Catalogo = require('../../models/catalogo-ventas/catalogo');
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewCatalogo = require('../../models/catalogo-ventas/sql-vistas/view_catalogo');

// Llamar todas las preguntas paginadas
const getCatalogos = async (req = request, res = response) => {
    
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
        const catalogos = await ViewCatalogo.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }]
            }
        });

        // Contar resultados total
        const countCatalogos = await ViewCatalogo.count({where: {
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
                },{
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 17, 'CONSULTA', `SE BUSCÓ EL CATÁLOGO CON EL TÉRMINO: '${buscar}'`);
        }

        // Respuesta
        res.json( {limite, countCatalogos, catalogos} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo Producto
const getCatalogo = async (req = request, res = response) => {
     
    const { id } = req.params

    try {
        
        const catalogo = await ViewCatalogo.findByPk( id );

        // Validar Existencia
        if( !catalogo ){
            return res.status(404).json({
                msg: 'No existe un catálogo con el id ' + id
            })
        }

        res.json({ catalogo })

    } 
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const postCatalogo = async (req = request, res = response) => {
    //body
    const { nombre_catalogo = "", id_usuario } = req.body;
    
    try {
 
        // Construir modelo
        const nuevoCatalogo = await Catalogo.build({
            NOMBRE_CATALOGO: nombre_catalogo,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        });
        // Insertar a DB
        await nuevoCatalogo.save();   
        
        // Guardar evento
        eventBitacora(new Date, id_usuario, 17, 'NUEVO', `SE CREO UN NUEVO CATÁLOGO DE PRODUCTOS ${nuevoCatalogo.NOMBRE_CATALOGO}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Catálogo: '+ nombre_catalogo + ' ha sido creado con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putCatalogo = async (req = request, res = response) => {
    const { id } = req.params
    const { nombre_catalogo = "", id_usuario } = req.body;

    try {

        const catalogo = await Catalogo.findByPk(id);
        
        // Si llega sin cambios
        if(!((catalogo.NOMBRE_CATALOGO == nombre_catalogo || nombre_catalogo === ""))) {

            eventBitacora(new Date, id_usuario, 17, 'ACTUALIZACION', `CATÁLOGO ${catalogo.NOMBRE_CATALOGO}, ACTUALIZADO A : ${nombre_catalogo !== "" && catalogo.NOMBRE_CATALOGO != nombre_catalogo ? `${nombre_catalogo}` : ""}`);

        }

        // Actualizar db Catálogo
        await Catalogo.update({
            NOMBRE_CATALOGO: nombre_catalogo !== "" ? nombre_catalogo : Catalogo.NOMBRE_CATALOGO,
        }, {
            where: {
                ID: id
            }
        })

        res.json({
            ok: true,
            msg: 'Catálogo de Productos: '+ catalogo.NOMBRE_CATALOGO + ' ha sido actualizado con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const deleteCatalogo = async (req = request, res = response) => {
    const { id } = req.params
    const { quienElimina } = req.query

    try {

        // Llamar el catálogo a borrar
        const catalogo = await Catalogo.findByPk( id );

        // Extraer el nombre del catálogo
        const { NOMBRE_CATALOGO } = catalogo;

        // Borrar catalogo
        await catalogo.destroy();

        // Guardar evento
        eventBitacora(new Date, quienElimina, 17, 'BORRADO', `SE ELIMINO EL CATÁLOGO ${NOMBRE_CATALOGO}`);

        res.json({
            ok: true,
            msg: `El catálogo: ${NOMBRE_CATALOGO} ha sido eliminado`
        });

    } catch (error) {
        if( error instanceof ForeignKeyConstraintError ) {
            res.status(403).json({
                ok: false,
                msg: `El catálogo de productos no puede ser eliminado`
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
    getCatalogos,
    getCatalogo,
    postCatalogo,
    putCatalogo,
    deleteCatalogo
   /*  getUnidad,
    postUnidad,
    putUnidad,
    deleteUnidad */
}
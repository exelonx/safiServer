const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const { eventBitacora } = require('../../helpers/event-bitacora');
const Impuesto = require('../../models/catalogo-ventas/tipo-impuesto');

const getImpuestos = async (req = request, res = response) => {
    
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
        const impuestos = await Impuesto.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }]
            }
        });

        // Contar resultados total
        const countImpuestos = await Impuesto.count({where: {
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    PORCENTAJE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 24, 'CONSULTA', `SE BUSCÓ EL IMPUESTO CON EL TÉRMINO: '${buscar}'`);
        }

        // Respuesta
        res.json( {limite, countImpuestos, impuestos} )
        console.log(res.json)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const getImpuesto = async (req = request, res = response) => {
     
    const { id } = req.params

    try {
        
        const impuesto = await Impuesto.findByPk( id );

        // Validar Existencia
        if( !impuesto ){
            return res.status(404).json({
                msg: 'No existe un impuesto con el id ' + id
            })
        }

        res.json({ impuesto })

    } 
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const postImpuesto = async (req = request, res = response) => {
    //body
    const { nombre = "", porcentaje = "", id_usuario } = req.body;
    
    try {
 
        // Construir modelo
        const nuevoImpuesto = await Impuesto.create({
            NOMBRE: nombre,
            PORCENTAJE: porcentaje,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        });
 
        // Guardar evento
        eventBitacora(new Date, id_usuario, 24, 'NUEVO', `SE CREÓ UN NUEVO TIPO DE IMPUESTO ${nuevoImpuesto.NOMBRE}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Impuesto: '+ nombre + ' ha sido creado con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putImpuesto = async (req = request, res = response) => {
    const { id } = req.params
    const { nombre = "", porcentaje = "", id_usuario } = req.body;

    try {

        const impuesto = await Impuesto.findByPk(id);
        
        // Si llega sin cambios
        if(!((impuesto.NOMBRE == nombre || nombre === ""))) {

            eventBitacora(new Date, id_usuario, 24, 'ACTUALIZACION', `IMPUESTO ${impuesto.NOMBRE}, ACTUALIZADO A : ${nombre !== "" && impuesto.NOMBRE != nombre ? `${nombre}` : ""}`);

        }

        // Actualizar db Catálogo
        await Impuesto.update({
            NOMBRE: nombre !== "" ? nombre : Impuesto.NOMBRE,
            PORCENTAJE: porcentaje !== "" ? porcentaje : Impuesto.PORCENTAJE,
        }, {
            where: {
                id: id
            }
        })

        res.json({
            ok: true,
            msg: 'Impuesto: '+ impuesto.NOMBRE + ' ha sido actualizado con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const deleteImpuesto = async (req = request, res = response) => {
    const { id_impuesto } = req.params
    const { quienElimina } = req.query

    try {

        // Llamar el catálogo a borrar
        const impuesto = await Impuesto.findByPk( id_impuesto );

        if (!impuesto) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe el impuesto'
            })
        }
        // Extraer el nombre del catálogo
        const { NOMBRE } = impuesto;

        // Borrar catalogo
        await impuesto.destroy();

        // Guardar evento
        eventBitacora(new Date, quienElimina, 24, 'BORRADO', `SE ELIMINÓ EL IMPUESTO ${NOMBRE}`);

        res.json({
            ok: true,
            msg: `El impuesto: ${NOMBRE} ha sido eliminado`
        });

    } catch (error) {
        if( error instanceof ForeignKeyConstraintError ) {
            res.status(403).json({
                ok: false,
                msg: `El impuesto no puede ser eliminado`
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
    getImpuestos,
    getImpuesto,
    postImpuesto,
    putImpuesto,
    deleteImpuesto
}
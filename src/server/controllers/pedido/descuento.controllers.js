const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewDescuento = require('../../models/pedido/sql-vista/view_descuento');
const Descuento = require('../../models/pedido/descuento');

const getDescuentos = async (req = request, res = response) => {
    
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
        const descuentos = await ViewDescuento.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }]
            }
        });

        // Contar resultados total
        const countDescuentos = await ViewDescuento.count({where: {
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }]
            }
        });

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 29, 'CONSULTA', `SE BUSCÓ EL DESCUENTO CON EL TÉRMINO: '${buscar}'`);
        }

        // Respuesta
        res.json( {limite, countDescuentos, descuentos} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const getDescuento = async (req = request, res = response) => {
     
    const { id } = req.params

    try {
        
        const descuento = await ViewDescuento.findByPk( id );

        // Validar Existencia
        if( !descuento ){
            return res.status(404).json({
                msg: 'No existe un descuento con el id ' + id
            })
        }

        res.json({ descuento })

    } 
    catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const postDescuento = async (req = request, res = response) => {
    //body
    const { nombre = "", porcentaje = "", fijo = "", cantidad = "", id_usuario = "" } = req.body;
    
    try {
 
        // Construir modelo
        const nuevoDescuento = await Descuento.create({
            NOMBRE: nombre,
            PORCENTAJE: porcentaje,
            FIJO: fijo,
            CANTIDAD: cantidad,
            CREADO_POR: id_usuario
        });
 
        // Guardar evento
        eventBitacora(new Date, id_usuario, 29, 'NUEVO', `SE CREÓ UN DESCUENTO  ${nuevoDescuento.NOMBRE}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Descuento '+ descuento + ' ha sido creado con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putDescuento = async (req = request, res = response) => {
    const { id } = req.params
    const { nombre = "", porcentaje = "", fijo = "", cantidad = "", id_usuario } = req.body;

    try {

        const descuento = await Descuento.findByPk(id);
        
        // Si llega sin cambios
        if(!((descuento.NOMBRE == nombre || nombre === ""))) {

            eventBitacora(new Date, id_usuario, 25, 'ACTUALIZACION', `ESTADO ${descuento.NOMBRE}, ACTUALIZADO A : ${nombre !== "" && descuento.NOMBRE != descuento ? `${descuento}` : ""}`);

        }

        // Actualizar db Catálogo
        await Descuento.update({
            NOMBRE: nombre !== "" ? nombre : Descuento.NOMBRE,
            PORCENTAJE: porcentaje !== "" ? porcentaje : Descuento.PORCENTAJE,
            FIJO: fijo !== "" ? fijo : Descuento.FIJO,
            CANTIDAD: cantidad !== "" ? cantidad : Descuento.CANTIDAD
        }, {
            where: {
                id: id
            }
        })

        res.json({
            ok: true,
            msg: 'Descuento: '+ descuento.NOMBRE + ' ha sido actualizado con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const deleteDescuento = async (req = request, res = response) => {
    const { id_descuento} = req.params
    const { quienElimina } = req.query

    try {

        // Llamar el catálogo a borrar
        const descuento = await Descuento.findByPk( id_descuento );

        if (!descuento) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe el descuento'
            })
        }
        // Extraer el nombre del catálogo
        const { DESCUENTO } = descuento;

        // Borrar catalogo
        await descuento.destroy();

        // Guardar evento
        eventBitacora(new Date, quienElimina, 29, 'BORRADO', `SE ELIMINÓ EL DESCUENTO ${DESCUENTO}`);

        res.json({
            ok: true,
            msg: `El descuento: ${DESCUENTO} ha sido eliminado`
        });

    } catch (error) {
        if( error instanceof ForeignKeyConstraintError ) {
            res.status(403).json({
                ok: false,
                msg: `El descuento no puede ser eliminado`
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
    getDescuentos,
    getDescuento,
    postDescuento,
    putDescuento,
    deleteDescuento
}

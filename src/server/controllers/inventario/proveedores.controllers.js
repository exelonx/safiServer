const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const ViewProveedor = require('../../models/inventario/sql-vista/view-proveedor');
const Proveedor = require('../../models/inventario/proveedor');
const { eventBitacora } = require('../../helpers/event-bitacora');
const Departamento = require('../../models/direccion/departamento');
const Municipio = require('../../models/direccion/municipio');
const Direccion = require('../../models/direccion/direccion');

// Llamar todas las preguntas paginadas
const getProveedores = async (req = request, res = response) => {
    
    let { limite = 10, desde = 0, buscar = "", quienBusco = "" } = req.query

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
        const proveedores = await ViewProveedor.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });

        // Contar resultados total
        const countProveedores = await ViewProveedor.count({where: {
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 15, 'CONSULTA', `SE BUSCO A LOS PROVEEDORES CON EL TERMINO '${buscar}'`);
        }

        // Respuesta
        res.json( {limite, countProveedores, proveedores} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo Proveedor
const getProveedor = async (req = request, res = response) => {
     
    const { id } = req.params

    try {
        
        const proveedor = await ViewProveedor.findByPk( id );

        // Validar Existencia
        if( !proveedor ){
            return res.status(404).json({
                msg: 'No existe un proveedor con el id ' + id
            })
        }

        res.json({ proveedor })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const postProveedor = async (req = request, res = response) => {
    //body
    const { nombre = "", id_municipio = "", detalle = "", telefono = "", id_usuario = "" } = req.body;
    
    try {

        console.log("ESTE ES EL ID: "+id_municipio)

        // Construir modole de direccion
        const nuevaDireccion = await Direccion.create({
            ID_MUNICIPIO: id_municipio,
            DETALLE: detalle
        })

        // Construir modelo de proveedor
        const nuevoProveedor = await Proveedor.create({
            NOMBRE: nombre,
            ID_DIRECCION: nuevaDireccion.id,
            TELEFONO: telefono,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        });
   
        
        // Guardar evento
        eventBitacora(new Date, id_usuario, 15, 'NUEVO', `SE CREO EL PROVEEDOR ${nuevoProveedor.NOMBRE}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Proveedor: '+ nombre + ' ha sido creado con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putProveedor = async (req = request, res = response) => {
    const { id } = req.params
    const { id_departamento = "", id_municipio = "", id_direccion = "", nombre = "", telefono = "", direccion = "" } = req.body;
    const {id_usuario = ""} = req.query;

    try {

        const departamento = await Departamento.findByPk(id_departamento);
        const municipio = await Municipio.findByPk(id_municipio);
        const proveedor = await Proveedor.findByPk(id);
        // Si llega sin cambios
        if(!((proveedor.NOMBRE == nombre || nombre === "") 
            && (proveedor.TELEFONO == telefono || telefono === "")
            && (proveedor.ID_DIRECCION == id_direccion || id_direccion === "")
            && (departamento.ID == id_departamento || id_departamento === "")
            && (municipio.ID == id_municipio || id_municipio === ""))) {

                eventBitacora(new Date, id_usuario, 15, 'ACTUALIZACION', 
                `DATOS ACTUALIZADOS: ${nombre !== "" && proveedor.NOMBRE != nombre ? `${proveedor.NOMBRE} actualizado a ${nombre}` : ""}
                 ${telefono !== "" && proveedor.TELEFONO != telefono ? `${proveedor.TELEFONO} actualizado a ${telefono}` : ""}
                 ${id_direccion !=="" && proveedor.ID_DIRECCION != id_direccion ? `${proveedor.ID_DIRECCION} actualizado a ${id_direccion}` :""}`);

        } 

        /* `${departamento.NOMBRE}, ${municipio.NOMBRE}, ${direccion} ` */

        await Direccion.update({
            DETALLE: direccion !=="" ? direccion: Direccion.DETALLE,
            ID_MUNICIPIO: id_municipio !=="" ? id_municipio: Direccion.ID_MUNICIPIO
        },{
            where: {
                ID: id_direccion
            }
        })

        // Actualizar db Proveedor
        await Proveedor.update({
            /* ID_DIRECCION: id_direccion !== "" ? id_direccion : Proveedor.ID_DIRECCION, */
            NOMBRE: nombre !== "" ? nombre : Proveedor.NOMBRE,
            TELEFONO: telefono !== "" ? telefono : Proveedor.TELEFONO,
            MODIFICADO_POR: id_usuario !== "" ? id_usuario : Proveedor.MODIFICADO_POR
        }, {
            where: {
                ID: id
            }
        })

        res.json({
            ok: true,
            msg: 'Proveedor: '+ proveedor.NOMBRE + ' ha sido actualizado con éxito'
        });

    } catch (error) {
        console.log(error instanceof ForeignKeyConstraintError);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const deleteProveedor = async (req = request, res = response) => {
    const { id } = req.params
    const { quienElimina } = req.query

    try {

        // Llamar el proveedor a borrar
        const proveedor = await Proveedor.findByPk( id );

        // Extraer el nombre del proveedor
        const { NOMBRE } = proveedor;

        // Borrar Proveedor
        await proveedor.destroy();

        // Guardar evento
        eventBitacora(new Date, quienElimina, 15, 'BORRADO', `SE ELIMINO EL PROVEEDOR ${NOMBRE}`);

        res.json({
            ok: true,
            msg: `El proveedor: ${NOMBRE} ha sido eliminado`
        });

    } catch (error) {
        if( error instanceof ForeignKeyConstraintError ) {
            res.status(403).json({
                ok: false,
                msg: `El proveedor no puede ser eliminado`
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
    getProveedores,
    getProveedor,
    postProveedor,
    putProveedor,
    deleteProveedor
}

const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const ViewProveedor = require('../../models/inventario/sql-vista/view-proveedor');
const Proveedor = require('../../models/inventario/proveedor');
const { eventBitacora } = require('../../helpers/event-bitacora');

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
    const { nombre = "", id_direccion = "", telefono = "", id_usuario = "" } = req.body;
    
    try {
 
        // Construir modelo
        const nuevoProveedor = await Proveedor.build({
            NOMBRE: nombre,
            ID_DIRECCION: id_direccion,
            TELEFONO: telefono,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        });
        // Insertar a DB
        await nuevoProveedor.save();   
        
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
    const { id_direccion = "", nombre = "", telefono = "", id_usuario = "" } = req.body;

    try {

        const proveedor = await Proveedor.findByPk(id);
        console.log(nombre)
        // Si llega sin cambios
        if(!((proveedor.NOMBRE == nombre || nombre === "") 
            && (proveedor.TELEFONO == telefono || telefono === "")
            && (proveedor.ID_DIRECCION == id_direccion || id_direccion === ""))) {

                eventBitacora(new Date, id_usuario, 15, 'ACTUALIZACION', `DATOS ACTUALIZADOS: ${nombre !== "" ? 'NOMBRE' : ""}
                 ${telefono !== "" ? 'TELEFONO' : ""} ${id_direccion !=="" ? 'ID_DIRECCION' :""}`);

        }

        // Actualizar db Rol
        await Proveedor.update({
            ID_DIRECCION: id_direccion !== "" ? id_direccion : Proveedor.ID_DIRECCION,
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
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const deleteProveedor = async (req = request, res = response) => {
    const { id } = req.params
    const { quienElimina } = req.body

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

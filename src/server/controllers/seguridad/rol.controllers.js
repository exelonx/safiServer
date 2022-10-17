const { request, response } = require('express');
const { Op } = require('sequelize');

const Rol = require('../../models/seguridad/rol');
const ViewRol = require('../../models/seguridad/sql-vistas/view_rol');
const Parametro = require('../../models/seguridad/parametro');

// Llamar todos los roles paginados
const getRoles = async (req = request, res = response) => {
    
    let { limite, desde = 0, buscar = "", id_usuario } = req.query;

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
        const roles = await ViewRol.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    ROL: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    DESCRIPCION: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });
        
        // Contar resultados total
        const countRoles = await ViewRol.count({where: {
            [Op.or]: [{
                ROL: { [Op.like]: `%${buscar.toUpperCase() }%`}
            }, {
                DESCRIPCION: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }]
        }});

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, id_usuario, 8, 'CONSULTA', `SE BUSCO LOS ROL CON EL TERMINO ${buscar}`);
        }

        // Respuesta
        res.json( { limite, countRoles, roles} );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo Rol
const getRol = async (req = request, res = response) => {
     
    const { id_rol } = req.params

    try {
        
        const rol = await ViewRol.findByPk( id_rol );

        // Validar Existencia
        if( !rol ){
            return res.status(404).json({
                msg: 'No existe un rol con el id ' + id_rol
            })
        }

        res.json({ rol })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const postRol = async (req = request, res = response) => {
    //body
    const { rol, descripcion, id_usuario } = req.body;
    
    try {
 
        // Construir modelo
        const nuevoRol = await Rol.build({
            ROL: rol,
            DESCRIPCION: descripcion,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        });
        // Insertar a DB
        await nuevoRol.save();   
        
        // Guardar evento
        eventBitacora(new Date, id_usuario, 8, 'NUEVO', `SE CREO EL ROL ${nuevoRol.ROL}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Rol: '+ rol + ' ha sido creado con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putRol = async (req = request, res = response) => {
    const { id_rol } = req.params
    const { rol = "", descripcion = "", id_usuario = "" } = req.body;

    try {

        const rolAnterior = await Rol.findByPk(id_rol);

        if( rolAnterior.ROL === 'DEFAULT' ) {
            res.status(401).json({
                ok: false,
                msg: 'No se puede modificar el rol DEFAULT'
            })
        }

        // Actualizar db Rol
        await Rol.update({
            ROL: rol !== "" ? rol : Rol.ROL,
            DESCRIPCION: descripcion !== "" ? descripcion : Rol.DESCRIPCION,
            MODIFICADO_POR: id_usuario
        }, {
            where: {
                ID_ROL: id_rol
            }
        })

        // Guardar evento
        eventBitacora(new Date, id_usuario, 8, 'ACTUALIZACION', `SE ACTUALIZO EL ROL ${rolAnterior.ROL}`);

        res.json({
            ok: true,
            msg: 'Rol: '+ rolAnterior.ROL + ' ha sido actualizado con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const DeleteRol = async (req = request, res = response) => {
    const { id_rol } = req.params

    try {

        // Llamar el Rol a borrar
        const rol = await Rol.findByPk( id_rol );

        // Extraer el nombre del Rol
        const { ROL } = rol;

        // Borrar Rol
        await rol.destroy();

        // Guardar evento
        eventBitacora(new Date, quienModifico, 8, 'BORRADO', `SE ELIMINO EL ROL ${ROL}`);

        res.json({
            ok: false,
            msg: `El rol: ${ROL} ha sido eliminado`
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }  
}

module.exports = {
    getRoles,
    getRol,
    postRol,
    putRol,
    DeleteRol
}

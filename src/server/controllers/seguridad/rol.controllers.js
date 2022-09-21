const { request, response } = require('express');
const { Op } = require('sequelize');
const Rol = require('../../models/seguridad/rol');

// Llamar todos los roles paginados
const getRoles = async (req = request, res = response) => {
    
    let { limite = 10, desde = 0 } = req.query

    try {

        // Paginación
        const roles = await Rol.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10)
        });
        
        // Contar resultados total
        const countRoles = await Rol.count()

        // Respuesta
        res.json( { roles, countRoles} )

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
        
        const rol = await Rol.findByPk( id_rol );

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
    const { rol, descripcion } = req.body;
    
    try {

        // Construir modelo
        const nuevoRol = await Rol.build({
            ROL: rol,
            DESCRIPCION: descripcion,
        });

        // Insertar a DB
        await nuevoRol.save();   

        // Responder
        const { ROL, DESCRIPCION, ...resto } = nuevoRol
        res.json( {ROL, DESCRIPCION} );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putRol = async (req = request, res = response) => {
    const { id_rol } = req.params
    const { rol = "", descripcion = "" } = req.body;

    try {

        // Actualizar db Rol
        await Rol.update({
            ROL: rol !== "" ? rol : Rol.ROL,
            DESCRIPCION: descripcion !== "" ? descripcion : Rol.DESCRIPCION
        }, {
            where: {
                ID_ROL: id_rol
            }
        })

        res.json({ id_rol, rol, descripcion });

    } catch (error) {
        console.log(error);
        res.status(500).json({
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

        res.json({
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

const { request, response } = require('express');
const { Op } = require('sequelize');

const Permisos = require('../../models/seguridad/permiso');
const ViewPermisos = require('../..//models/seguridad/sql-vistas/view-permiso');

const getPermisos = async(req = request, res = response) => {

    const {buscar = ""} = req.body;
    let {limite = 20, desde = 0} = req.query;

    try {
        //Paginacion
        const permisos = await ViewPermisos.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where:{
                [Op.or]: [{
                    ROL: {[Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    OBJETO: {[Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });

        //Respuesta
        res.json({permisos})
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const getPermiso = async(req = request, res = response) => {

    const {id_rol} = req.params

    try {
        const rol = await ViewPermisos.findByPk(id_rol);

        // Validar Existencia
        if(!rol){
            return res.status(404).json({
                msg: `No existe permiso para este rol` + id_rol
            })
        }

        res.json(rol)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const putPermisos = async(req = request, res = response) =>{

    const {id_permiso} = req.params;
    const {permiso_insercion = "", permiso_eliminacion = "", permiso_actualizacion = "", permiso_consultar = "", id_usuario = ""} = req.body;

    try {
        await Permisos.update({
            PERMISO_INSERCION: permiso_insercion !== "" ? permiso_insercion : Permisos.PERMISO_INSERCION,
            PERMISO_ELIMINACION: permiso_eliminacion !== "" ? permiso_eliminacion : Permisos.PERMISO_ELIMINACION,
            PERMISO_ACTUALIZACION: permiso_actualizacion !== "" ? permiso_actualizacion : Permisos.PERMISO_ACTUALIZACION,
            PERMISO_CONSULTAR: permiso_consultar !== "" ? permiso_consultar : Permisos.PERMISO_CONSULTAR,
            MODIFICADO_POR: id_usuario
        }, {
            where:{
                ID_PERMISO: id_permiso
            }
        })

        res.json({permiso_insercion, permiso_eliminacion, permiso_actualizacion, permiso_consultar})
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

module.exports = {
    getPermisos,
    getPermiso,
    putPermisos
}
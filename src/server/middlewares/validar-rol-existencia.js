const { response, request } = require("express");
const Rol = require("../models/seguridad/rol");

const existeRol = async(req = request, res = response, next) => {

    const { rol } = req.body;
    // Validar que no exista rol repetido
    const rolRepetido = await Rol.findOne({
        where: {
            ROL: rol
        }
    })

    if ( rolRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El rol: ${ rol }, ya existe`
        }) 
    }

    next()
}

const noExisteRolPorId = async(req = request, res = response, next) => {

    const { id_rol } = req.params;
    // Validar que no exista rol repetido
    const rolRepetido = await Rol.findByPk( id_rol )

    if ( !rolRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El rol: ${ id_rol }, no existe`
        }) 
    }

    next()

}

module.exports = {
    existeRol,
    noExisteRolPorId
}

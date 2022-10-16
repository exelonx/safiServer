const Rol = require("../models/seguridad/rol");

const existeRol = async( rol ) => {

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

}

const noExisteRolPorId = async( rol ) => {

    // Validar que no exista rol repetido
    const rolRepetido = await Rol.findByPk( rol )

    if ( !rolRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El rol: ${ rol }, no existe`
        }) 
    }

}

module.exports = {
    existeRol,
    noExisteRolPorId
}

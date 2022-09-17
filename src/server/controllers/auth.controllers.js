const { response, request } = require("express");
const Usuario = require("../models/seguridad/usuario");
const bcrypt = require('bcryptjs');
const { generarJWT } = require("../helpers/jwt");

const login = async(req = request, res = response) => {

    const { usuario, contraseña } = req.body;

    try {
        // Confirmar existencia del usuario
        const dbUser = await Usuario.findOne({where: { USUARIO: usuario }})
        if( !dbUser ) {
            return res.status(404).json({
                ok: false,
                msg: 'El correo o la contraseña no coinciden'
            })
        }

        // Confirmar si el contraseña hace match
        const validarContraseña = await bcrypt.compareSync( contraseña, dbUser.CONTRASENA )
        if( !validarContraseña ) {
            return res.status(404).json({
                ok: false,
                msg: 'El correo o la contraseña no coinciden'
            })
        }

        // Generar JWT
        const token = await generarJWT(dbUser.ID_USUARIO, dbUser.ID_ROL)

        //Respuesta del servicio
        return res.json({
            ok: true,
            id_usuario : dbUser.ID_USUARIO,
            id_rol: dbUser.ID_ROL,
            estado: dbUser.ESTADO_USUARIO,
            token
        })

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con su administrador'
        })
    }
}

const revalidarToken = async(req = request, res = response) => {

    const { uid, name } = req;

    // Generar el JWT
    const token = await generarJWT( uid, name);

    return res.json({
        ok: true,
        uid,
        name,
        token
    })
}

module.exports = {
    login,
    revalidarToken
}
const { response, request } = require("express");
const Usuario = require("../models/seguridad/usuario");
const bcrypt = require('bcryptjs');
const { generarJWT } = require("../helpers/jwt");

const registrar = async(req = request, res = response) => {

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

        // Confirmar si el password hace match
        // const validarPassword = await bcrypt.compareSync( password, dbUser.password )
        // if( !validarPassword ) {
        //     return res.status(404).json({
        //         ok: false,
        //         msg: 'El correo o la contraseña no coinciden'
        //     })
        // }

        // Generar JWT
        const token = await generarJWT(dbUser.ID_USUARIO, dbUser.ID_ROL)

        //Respuesta del servicio
        return res.json({
            ok: true,
            id_usuario : dbUser.ID_USUARIO,
            id_rol: dbUser.ID_ROL,
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

module.exports = {
    registrar
}
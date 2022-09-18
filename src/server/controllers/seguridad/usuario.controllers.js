const { response, request } = require("express");
const Usuario = require("../../models/seguridad/usuario");
const bcrypt = require('bcryptjs');
const { generarJWT } = require("../../helpers/jwt");
const { resolveContent } = require("nodemailer/lib/shared");
const Parametro = require("../../models/seguridad/parametro");
const modificarDias = require("../../helpers/manipulacion-fechas");

const registrar = async(req = request, res = response) => {

    const { usuario, nombre_usuario, contrasena, rol, correo  } = req.body;

    try {

        // Verificar el email
        // let user = await Usuario.findOne({ USUARIO: usuario });

        // if (user) {
        //     return res.status(400).json({
        //         ok: false,
        //         msg: 'El usuario ya existe con ese email'
        //     })
        // }
        const diasVigencias = await Parametro.findOne({
            where:{
                PARAMETRO: 'ADMIN_DIAS_VIGENCIA'
            }
        });

        const fechaActual = new Date();
        const fechaVencimiento = (modificarDias(fechaActual, parseInt(diasVigencias.VALOR,10)));


        // Crear usuario con el modelo
        DBusuario = await Usuario.build({
            USUARIO: usuario,
            NOMBRE_USUARIO: nombre_usuario,
            CONTRASENA :contrasena,
            ID_ROL: rol,
            CORREO_ELECTRONICO: correo,
            FECHA_VENCIMIENTO: fechaVencimiento
        })

        // // Hashear contraseña
        const salt = bcrypt.genSaltSync();
        DBusuario.CONTRASENA = bcrypt.hashSync(contrasena, salt);

        // // Generar JWT
        const token = await generarJWT(DBusuario.id, usuario)

        // // Crear usuario de DB
        // DBusuario.save()

        // // Generar respuesta exitosa
        return res.status(201).json({
            ok: true,
            uid: DBusuario.id,
            usuario, 
            nombre_usuario,  
            rol, 
            correo,
            token
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }

}



module.exports = {
    registrar
}
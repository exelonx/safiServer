const { response, request } = require("express");
const Usuario = require("../../models/seguridad/usuario");
const bcrypt = require('bcryptjs');
const Cryptr = require('cryptr');
const { generarJWT } = require("../../helpers/jwt");
const ViewUsuarios = require("../../models/seguridad/sql-vistas/view_usuario");
const Parametro = require("../../models/seguridad/parametro");
const { crearTransporteSMTP } = require("../../configs/nodemailer");

const login = async(req = request, res = response) => {

    const { usuario, contrasena } = req.body;

    try {
        // Confirmar existencia del usuario
        const dbUser = await Usuario.findOne({where: { USUARIO: usuario }})
        const intentosParametro = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_INTENTOS' }})

        if( !dbUser ) {
            return res.status(404).json({
                ok: false,
                msg: 'El correo o la contraseña no coinciden'
            })
        }

        // Confirmar si el contraseña hace match
        const validarContraseña = await bcrypt.compareSync( contrasena, dbUser.CONTRASENA )
        if( !validarContraseña ) {
            let msgIntentos;

            //Incrementa en 1 los intentos usados
            dbUser.INTENTOS++;

            //Bloquear usuario si los intentos se acaban
            if(dbUser.INTENTOS === parseInt( intentosParametro.VALOR, 10 )) {

                dbUser.ESTADO_USUARIO = 'BLOQUEADO'
                // Notificar por correo
                const transporte = await crearTransporteSMTP();
                await transporte.sendMail({
                    from: '"Dr. Burger 🍔" <drburger.safi.mailer@gmail.com>', // sender address
                    to: dbUser.CORREO_ELECTRONICO, // list of receivers
                    subject: "Cuenta bloqueada 🍔👌", // Subject line
                    html: `<b>Su cuenta ha superado los intentos permitidos y ha sido bloqueada, cambie la contraseña o comuniquese con el administrador</b>
                    <img src="cid:unique@kreata.ee"/>`,
                    attachments: [{
                        filename: 'image.png',
                        path: './src/assets/svg/foto2.png',
                        cid: 'unique@kreata.ee' //same cid value as in the html img src
                    }]
                })
                msgIntentos = 'Ha superado los intentos permitidos, su cuenta ha sido bloqueada, reinicie la contraseña.'

            }
            // Guardar cambios del usuario
            await dbUser.save();
            // Retornar que no coincide la contraseña
            return res.status(404).json({
                ok: false,
                msg: 'El correo o la contraseña no coinciden',
                msgIntentos
            })
        }

        // Confirmar acceso válido
        if( !(dbUser.ESTADO_USUARIO === 'NUEVO' || !dbUser.ESTADO_USUARIO === 'ACTIVO') ) {
            if(dbUser === 'BLOQUEADO') {
                return res.status(401).json({
                    ok: false,
                    msg: `El usuario esta bloqueado, hable con el administrador o reinicie la contraseña`
                })
            }
            // Si el estado no es nuevo o activo
            return res.status(401).json({
                ok: false,
                msg: `El usuario esta ${dbUser.ESTADO_USUARIO.charAt(dbUser.ESTADO_USUARIO.length-1) === 'O' ? ''.trim() : 'en '}${dbUser.ESTADO_USUARIO.toLowerCase()}, hable con el administrador`
            })
        }

        // Válidar tener un rol
        if( !dbUser.ID_ROL ) {
            return res.status(401).json({
                ok: false,
                msg: 'El usuario no tiene acceso válido, hable con el administrador'
            })
        }

        // Validar fecha de contraseña siga siendo válida
        if (dbUser.FECHA_VENCIMIENTO < new Date()){
            return res.status(401).json({
                ok: false,
                msg: 'Contraseña del usuario ha caducado, cambie la contraseña'
            })
        }

        // Generar JWT
        const token = await generarJWT( dbUser.ID_USUARIO, '1h', process.env.SEMILLA_SECRETA_JWT_LOGIN )

        
        dbUser.INTENTOS = 0;                        // Reiniciar intentos a 0
        dbUser.PRIMER_INGRESO++                     // Aumentar contador de ingresos
        dbUser.FECHA_ULTIMA_CONEXION = new Date();  // Registrar última conexión
        await dbUser.save();

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

    const { uid } = req;

    // Buscar usuario
    const usuario = await Usuario.findByPk( uid );

    if( usuario.ESTADO_USUARIO === 'BLOQUEADO') {
        return res.status(401).json({
            ok: false,
            msg: 'El usuario esta bloqueado, hable con el administrador o reinicie la contraseña'
        })
    }

    // Generar el JWT
    const token = await generarJWT( uid, '1h', process.env.SEMILLA_SECRETA_JWT_LOGIN );

    return res.json({
        ok: true,
        uid,
        id_rol: usuario.ID_ROL,
        estado: usuario.ESTADO_USUARIO,
        token
    })
}

const generarCorreoRecuperacion = async(req = request, res = response) => {

    const { usuario = "" } = req.body;

    // Buscar usuario
    const usuarioSinPass = await Usuario.findOne({where: { USUARIO: usuario }});
    if ( !usuarioSinPass ) {
        return res.status(404).json({
            ok: false,
            msg: 'El usuario no existe.'
        })
    }

    // Buscar parametros de duración de token de correo
    const duracionTokenPass = await Parametro.findOne( {where: { PARAMETRO: 'CORREO_VIGENCIA_PASS'}} )

    // Generar JWT
    const token = await generarJWT( usuarioSinPass.ID_USUARIO, `1h`, process.env.SEMILLA_SECRETA_JWT_CORREO );

    // TODO: ENVIAR CORREO
    const transporte = await crearTransporteSMTP();
    await transporte.sendMail({
        from: '"Dr. Burger 🍔" <drburger.safi.mailer@gmail.com>', // sender address
		to: "kevin.cubas.hn@outlook.com", // list of receivers
		subject: "Recuperación de contraseña 🍔👌", // Subject line
		text: "haga clic en el siguiente enlace o péguelo en su navegador para completar el proceso de recuperación: ", // plain text body
		html: `<a href=http://localhost:4200/${token}">Recuperar contraseña</a><br> Embedded image: <img src="cid:unique@kreata.ee"/>`,
		attachments: [{
			filename: 'image.png',
			path: './src/assets/svg/foto2.png',
			cid: 'unique@kreata.ee' //same cid value as in the html img src
		}]
	});
    // Respuesta
    return res.json({
        ok: true,
        msg: '¡Correo enviado con éxito!'
    });
    
}

module.exports = {
    login,
    revalidarToken,
    generarCorreoRecuperacion
}
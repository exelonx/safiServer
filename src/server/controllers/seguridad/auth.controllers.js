const { response, request } = require("express");
const Usuario = require("../../models/seguridad/usuario");
const bcrypt = require('bcryptjs');
const { generarJWT } = require("../../helpers/jwt");
const Parametro = require("../../models/seguridad/parametro");
const { crearTransporteSMTP } = require("../../helpers/nodemailer");
const PreguntaUsuario = require("../../models/seguridad/pregunta-usuario");
const { eventBitacora } = require("../../helpers/event-bitacora");
const Roles = require("../../models/seguridad/rol");

const login = async(req = request, res = response) => {

    const { usuario, contrasena } = req.body;

    try {
        // Confirmar existencia del usuario
        const dbUser = await Usuario.findOne({where: { USUARIO: usuario }})
        const intentosParametro = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_INTENTOS' }})
        // Parametros del mailer
        const correoSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_CORREO' }});
        const nombreEmpresaSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_NOMBRE_EMPRESA' }});
        const transporte = await crearTransporteSMTP(); // Transportador

        if( !dbUser ) {
            return res.status(404).json({
                ok: false,
                msg: 'El correo o la contraseña no coinciden'
            })
        }

        // Confirmar si el contraseña hace match
        const validarContraseña = await bcrypt.compareSync( contrasena, dbUser.CONTRASENA )
        if( !validarContraseña ) {

            // Incrementa en 1 los intentos usados
            dbUser.INTENTOS++;

            // Guardar evento
            eventBitacora(new Date, dbUser.ID_USUARIO, 3, 'INGRESO', `INTENTO #${dbUser.INTENTOS} DE INICIO DE SESIÓN SIN ÉXITO`);

            // Bloquear usuario si los intentos se acaban
            if(dbUser.INTENTOS === parseInt( intentosParametro.VALOR, 10 )) {

                dbUser.ESTADO_USUARIO = 'BLOQUEADO';

                // Guardar evento
                if( parseInt( intentosParametro.VALOR, 10 ) === 1 ) {
                    eventBitacora(new Date, dbUser.ID_USUARIO, 3, 'INGRESO', `USUARIO BLOQUEADO POR INICIO DE SESIÓN SIN ÉXITO`);
                } else {
                    eventBitacora(new Date, dbUser.ID_USUARIO, 3, 'INGRESO', `USUARIO BLOQUEADO POR SUPERAR LOS ${intentosParametro.VALOR} INTENTOS DE INICIO DE SESIÓN`);
                }

                // Notificar por correo
                transporte.sendMail({
                    from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR}>`, // Datos de emisor
                    to: dbUser.CORREO_ELECTRONICO, // Receptop
                    subject: "Cuenta bloqueada 🍔", // Asunto
                    html: `<b>Su cuenta ha superado los intentos permitidos y ha sido bloqueada, 
                    cambie la contraseña o comuniquese con el administrador</b>`
                }, (err) => {
                    if(err) { console.log( err ) };
                })

                // Guardar cambios del usuario
                await dbUser.save();

                return res.status(404).json({
                    ok: false,
                    msg: 'Ha superado los intentos permitidos, su cuenta ha sido bloqueada, reinicie la contraseña.'
                });

            };

            // Guardar cambios del usuario
            await dbUser.save();
            
            // Retornar que no coincide la contraseña
            return res.status(404).json({
                ok: false,
                msg: 'El correo o la contraseña no coinciden'
            });
        };

        // Confirmar acceso válido
        if( !(dbUser.ESTADO_USUARIO === 'NUEVO' || dbUser.ESTADO_USUARIO === 'ACTIVO') ) {

            if(dbUser.ESTADO_USUARIO === 'BLOQUEADO') {

                // Guardar evento
                eventBitacora(new Date, dbUser.ID_USUARIO, 3, 'INGRESO', `INTENTO DE INICIO DE SESIÓN CON USUARIO BLOQUEADO`);

                return res.status(401).json({
                    ok: false,
                    msg: `El usuario esta bloqueado, hable con el administrador o reinicie la contraseña`
                })
            };

            // Guardar evento
            eventBitacora(new Date, dbUser.ID_USUARIO, 3, 'INGRESO', `INTENTO DE INICIO DE SESIÓN CON USUARIO ${dbUser.ESTADO_USUARIO.charAt(dbUser.ESTADO_USUARIO.length-1) === 'O' ? ''.trim() : 'EN '}${dbUser.ESTADO_USUARIO}`);

            // Si el estado no es nuevo o activo
            return res.status(401).json({
                ok: false,
                msg: `El usuario esta ${dbUser.ESTADO_USUARIO.charAt(dbUser.ESTADO_USUARIO.length-1) === 'O' ? ''.trim() : 'en '}${dbUser.ESTADO_USUARIO.toLowerCase()}, hable con el administrador`
            });

        };

        // Válidar tener un rol
        if( !dbUser.ID_ROL ) {
            // Notificar por correo
            transporte.sendMail({
                from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR}>`, // Datos de emisor
                to: dbUser.CORREO_ELECTRONICO, // Receptop
                subject: "Acceso no válido 🍔", // Asunto
                html: `<b>Su cuenta no tiene los accesos válidos, hable con el administrador</b>`
            }, (err) => {
                if(err) { console.log( err ) };
            })

            // Guardar evento
            eventBitacora(new Date, dbUser.ID_USUARIO, 3, 'INGRESO', `INTENTO DE INICIO DE SESIÓN SIN ACCESO VÁLIDO`);

            return res.status(401).json({
                ok: false,
                msg: 'El usuario no tiene acceso válido, hable con el administrador'
            });
        };

        // Validar fecha de contraseña siga siendo válida
        if (dbUser.FECHA_VENCIMIENTO < new Date()){
            
            // Guardar evento
            eventBitacora(new Date, dbUser.ID_USUARIO, 3, 'INGRESO', `INTENTO DE INICIO DE SESIÓN CON CONTRASEÑA CADUCADA`);

            return res.status(401).json({
                ok: false,
                msg: 'Contraseña del usuario ha caducado, cambie la contraseña'
            });
        };

        // Generar JWT
        const duracionTokenLogin = await Parametro.findOne({where: {PARAMETRO: 'SESION_TOKEN_DURACION'}});
        const token = await generarJWT( dbUser.ID_USUARIO, duracionTokenLogin.VALOR, process.env.SEMILLA_SECRETA_JWT_LOGIN );

        const nombreROL = await Roles.findByPk(dbUser.ID_ROL);
        
        dbUser.INTENTOS = 0;                        // Reiniciar intentos a 0
        dbUser.PRIMER_INGRESO++                     // Aumentar contador de ingresos
        dbUser.FECHA_ULTIMA_CONEXION = new Date();  // Registrar última conexión
        await dbUser.save();

        // Guardar evento
        eventBitacora(new Date, dbUser.ID_USUARIO, 3, 'INGRESO', `USUARIO INICIO SESIÓN`);

        //Respuesta del servicio
        return res.json({
            ok: true,
            id_usuario : dbUser.ID_USUARIO,
            id_rol: dbUser.ID_ROL,
            rol: nombreROL,
            estado: dbUser.ESTADO_USUARIO,
            nombre: dbUser.NOMBRE_USUARIO,
            usuario: dbUser.USUARIO,
            correo: dbUser.CORREO_ELECTRONICO,
            fecha_vencimiento: dbUser.FECHA_VENCIMIENTO,
            token
        });

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con su administrador'
        });
    };
}

const revalidarToken = async(req = request, res = response) => {

    // Trae el uid del middleware validador de Tokens
    const { uid } = req;

    // Buscar usuario
    const usuario = await Usuario.findByPk( uid );

    // Si se bloquea el usuario sus tokens quedan invalidos
    if( !(usuario.ESTADO_USUARIO === 'NUEVO' || usuario.ESTADO_USUARIO === 'ACTIVO') ) {
        return res.status(401).json({
            ok: false,
            msg: 'El usuario no tiene acceso, hable con el administrador'
        });
    };

    // Generar el JWT
    const duracionTokenLogin = await Parametro.findOne({where: {PARAMETRO: 'SESION_TOKEN_DURACION'}});
    const token = await generarJWT( uid, duracionTokenLogin.VALOR, process.env.SEMILLA_SECRETA_JWT_LOGIN );

    return res.json({
        ok: true,
        id_usuario: uid,
        id_rol: usuario.ID_ROL,
        estado: usuario.ESTADO_USUARIO,
        nombre: usuario.NOMBRE_USUARIO,
        correo: usuario.CORREO_ELECTRONICO,
        fecha_vencimiento: usuario.FECHA_VENCIMIENTO,
        token
    });
}

const generarCorreoRecuperacion = async(req = request, res = response) => {

    const { usuario = "" } = req.body;

    // Buscar usuario
    const usuarioSinPass = await Usuario.findOne({where: { USUARIO: usuario }});
    if ( !usuarioSinPass ) {
        return res.status(404).json({
            ok: false,
            msg: 'El usuario no existe.'
        });
    };

    // Buscar parametros de duración de token de correo
    const duracionTokenPass = await Parametro.findOne( {where: { PARAMETRO: 'SESION_TOKEN_DURACION' }} );

    // Generar JWT
    const token = await generarJWT( usuarioSinPass.ID_USUARIO, duracionTokenPass.VALOR, process.env.SEMILLA_SECRETA_JWT_CORREO );

    // Guardar evento
    eventBitacora(new Date, usuarioSinPass.ID_USUARIO, 6, 'SOLICITUD', `SOLICITUD DE CORREO DE RECUPERACIÓN DE CONTRASEÑA`);

    // TODO: ENVIAR CORREO
    const transporte = await crearTransporteSMTP(); // Transportador
    // Parametros del mailer
    const correoSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_CORREO' }});
    const nombreEmpresaSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_NOMBRE_EMPRESA' }});
    transporte.sendMail({
        from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR}>`, // Datos de emisor
		to: usuarioSinPass.CORREO_ELECTRONICO, // Receptor
		subject: "Recuperación de contraseña 🍔👌", // Asunto
		html: `<b>haga clic en el siguiente enlace o péguelo en su navegador para completar el proceso de recuperación: </b>
        <a href=http://localhost:4200/auth/cambio-contrasena/${token}>Recuperar contraseña</a><br>`,
	}, (err) => {
        if(err) { console.log( err ) };
    });
    // Respuesta
    return res.json({
        ok: true,
        msg: '¡Correo enviado con éxito!'
    });
    
}

const revalidarTokenCorreo = async(req = request, res = response) => {

    const { uid } = req;

    return res.json({
        ok: true,
        id_usuario: uid,
    });

}

// Validar que exista usuario para recuperar por pregunta
const usuarioPorUsernameRecovery = async (req = request, res = response) => {

    const { usuario } = req.body;

    try {
        
        // Buscar usuario en la DB
        const dbUsuario = await Usuario.findOne({
            where: {
                USUARIO: usuario
            }
        })

        // Validar existencia del usuario
        if( !dbUsuario ) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe el usuario ingresado'
            })
        }

        // -------------- Validar que tenga configuradas las preguntas ---------------
        // Contar las preguntas usuario
        const preguntaUsuario = await PreguntaUsuario.count({
            where: {
                ID_USUARIO: dbUsuario.ID_USUARIO
            }
        });

        // Traer los parametros de número de preguntas
        const parametroNumPreguntas = await Parametro.findOne({
            where: {
                PARAMETRO: 'ADMIN_PREGUNTAS'
            }
        })

        if( preguntaUsuario < parametroNumPreguntas.VALOR ) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no tiene configuradas las preguntas secretas'
            })
        }

        // Generar JWT 
        const token = await generarJWT( dbUsuario.ID_USUARIO, '10m', process.env.SEMILLA_SECRETA_JWT_PREGUNTA );

        // Guardar evento
        eventBitacora(new Date, dbUsuario.ID_USUARIO, 6, 'INGRESO', `INGRESO A CAMBIO DE CONTRASEÑA POR PREGUNTA SECRETA`);

        // Retornar el ID del usuario
        res.json({
            ok: true,
            token: token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const revalidarTokenPregunta = async(req = request, res = response) => {

    const { uid } = req;

    // Validar que tenga configuradas las preguntas (PENSAR EN LA PEOR SITUACIÓN ES LO MEJOR)
    // Contar las preguntas usuario
    const preguntaUsuario = await PreguntaUsuario.count({
        where: {
            ID_USUARIO: uid
        }
    });

    // Traer los parametros de número de preguntas
    const parametroNumPreguntas = await Parametro.findOne({
        where: {
            PARAMETRO: 'ADMIN_PREGUNTAS'
        }
    })

    if( preguntaUsuario < parametroNumPreguntas.VALOR ) {
        return res.status(404).json({
            ok: false,
            msg: 'Usuario no tiene configuradas las preguntas secretas'
        })
    }

    return res.json({
        ok: true,
        id_usuario: uid,
    });

}

module.exports = {
    login,
    revalidarToken,
    generarCorreoRecuperacion,
    revalidarTokenCorreo,
    revalidarTokenPregunta,
    usuarioPorUsernameRecovery
}
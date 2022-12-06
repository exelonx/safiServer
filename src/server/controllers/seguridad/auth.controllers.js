const { response, request } = require("express");
const bcrypt = require('bcryptjs');

const Usuario = require("../../models/seguridad/usuario");
const Parametro = require("../../models/seguridad/parametro");
const Roles = require("../../models/seguridad/rol");
const ViewUsuarios = require("../../models/seguridad/sql-vistas/view_usuario");

const { generarJWT } = require("../../helpers/jwt");
const { crearTransporteSMTP } = require("../../helpers/nodemailer");
const { eventBitacora } = require("../../helpers/event-bitacora");
const { cargarOpcionesHBS } = require("../../templates/mail/opcionCorreoHbs");
const hbs = require("nodemailer-express-handlebars");

const login = async(req = request, res = response) => {

    const { usuario, contrasena } = req.body;

    try {
        // Confirmar existencia del usuario
        const dbUser = await Usuario.findOne({where: { USUARIO: usuario }})
        const intentosParametro = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_INTENTOS' }})
        // Parametros del mailer
        const correoSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_CORREO' }});
        const nombreEmpresaSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_NOMBRE_EMPRESA' }});
        // Template del correo
        const handlebarOptions = cargarOpcionesHBS()
        const transporte = await crearTransporteSMTP(); // Transportador
        transporte.use('compile', hbs(handlebarOptions))

        
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
            if(dbUser.INTENTOS === parseInt( intentosParametro.VALOR, 10 ) && !(dbUser.USUARIO === 'ROOT')) {

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
                    template: 'correos',
                    context: {
                        titulo: 'Bloqueo de cuenta',
                        contenido: `Le informamos que su cuenta ha sido bloqueada debido a que ha excedido el número de intentos permitidos para ingresar su contraseña.`
                    }
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

        // Traer el rol default
        const rolDefault = await Roles.findOne({where: {ROL: 'DEFAULT'}})

        // Válidar tener un rol con acceso
        if( dbUser.ID_ROL === rolDefault.ID_ROL ) {
            // Notificar por correo
            transporte.sendMail({
                from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR}>`, // Datos de emisor
                to: dbUser.CORREO_ELECTRONICO, // Receptop
                subject: "Acceso no válido 🍔", // Asunto
                template: 'correos',
                context: {
                    titulo: 'Acceso <strong>restringido</strong>',
                    contenido: `Su cuenta no posee un acceso válido al sistema, contacte con el administrador para solicitar el acceso al sistema.`
                }
            }, (err) => {
                if(err) { console.log( err ) };
            })

            // Guardar evento
            eventBitacora(new Date, dbUser.ID_USUARIO, 3, 'INGRESO', `INTENTO DE INICIO DE SESIÓN SIN ACCESO VÁLIDO`);

            return res.status(401).json({
                ok: false,
                msg: 'El usuario no tiene acceso válido, hable con el administrador para solicitar acceso'
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
        eventBitacora(new Date, dbUser.ID_USUARIO, 3, 'INGRESO', `${dbUser.USUARIO} INICIO SESIÓN`);

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
    const usuario = await ViewUsuarios.findByPk( uid );

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
        usuario: usuario.USUARIO,
        rol: usuario.ROL,
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
    const duracionTokenPass = await Parametro.findOne( {where: { PARAMETRO: 'CORREO_RECUPERACION_DURACION' }} );

    // Generar JWT
    const token = await generarJWT( usuarioSinPass.ID_USUARIO, duracionTokenPass.VALOR, process.env.SEMILLA_SECRETA_JWT_CORREO );

    // Guardar evento
    eventBitacora(new Date, usuarioSinPass.ID_USUARIO, 6, 'SOLICITUD', `SOLICITUD DE CORREO DE RECUPERACIÓN DE CONTRASEÑA`);

    // TODO: ENVIAR CORREO
    const transporte = await crearTransporteSMTP(); // Transportador

    // Template del correo
    const handlebarOptions = cargarOpcionesHBS()
    transporte.use('compile', hbs(handlebarOptions))

    // Parametros del mailer
    const correoSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_CORREO' }});
    const nombreEmpresaSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_NOMBRE_EMPRESA' }});
    transporte.sendMail({
        from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR}>`, // Datos de emisor
		to: usuarioSinPass.CORREO_ELECTRONICO, // Receptor
		subject: "Recuperación de contraseña 🍔👌", // Asunto
        template: 'correos',
        context: {
            titulo: 'Enlace de recuperación de <strong>contraseña</strong>',
            contenido: `El siguiente enlace lo redirigirá al sitio para recuperar su contraseña.<br>
            haga clic sobre el enlace o péguelo en su navegador para completar el proceso de recuperación: 
            <a href="${process.env.DOMINIO_PAG}/auth/cambio-contrasena/${token}">Recuperar contraseña</a><br><br>
            <span style="font-size: 12px;">El enlace expirará en ${duracionTokenPass.VALOR}.</span>`
        }
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
        if( dbUsuario.ESTADO_USUARIO === 'NUEVO' ) {
            return res.status(401).json({
                ok: false,
                msg: 'Usuario no tiene configuradas las preguntas secretas'
            })
        }

        // Validar que el usuario sea válido
        if( dbUsuario.ESTADO_USUARIO === 'INACTIVO' ) {
            return res.status(401).json({
                ok: false,
                msg: 'El usuario está inactivo'
            })
        }

        // Buscar duración del token
        const vigencia = await Parametro.findOne({where: {PARAMETRO: 'SESION_TOKEN_PREGUNTA_VIGENCIA'}});

        // Generar JWT 
        const token = await generarJWT( dbUsuario.ID_USUARIO, vigencia.VALOR, process.env.SEMILLA_SECRETA_JWT_PREGUNTA );

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
    const dbUsuario = await Usuario.findByPk(uid)

    if( dbUsuario.ESTADO_USUARIO === 'NUEVO' ) {
        return res.status(401).json({
            ok: false,
            msg: 'Usuario no tiene configuradas las preguntas secretas'
        })
    }

    // Validar que el usuario sea válido
    if( dbUsuario.ESTADO_USUARIO === 'INACTIVO' ) {
        return res.status(401).json({
            ok: false,
            msg: 'El usuario está inactivo'
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
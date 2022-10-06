const { response, request } = require("express");
const Usuario = require("../../models/seguridad/usuario");
const bcrypt = require('bcryptjs');
const Parametro = require("../../models/seguridad/parametro");
const modificarDias = require("../../helpers/manipulacion-fechas");
const { Op, where } = require("sequelize");
const ViewUsuarios = require("../../models/seguridad/sql-vistas/view_usuario");
const Usuarios = require("../../models/seguridad/usuario");
const HistorialContrasena = require('../../models/seguridad/historial-contrena');
const { crearTransporteSMTP } = require("../../helpers/nodemailer");
const PreguntaUsuario = require("../../models/seguridad/pregunta-usuario");
const { eventBitacora } = require("../../helpers/event-bitacora");


const registrar = async(req = request, res = response) => {

    const { usuario = "", nombre_usuario = "", contrasena = "", confirmContrasena = "", correo = "" } = req.body;

    try {

        // Validar que hagan match la confirmación de contraseña
        if( contrasena !== confirmContrasena ) {
            return res.status(401).json({
                ok: false,
                msg: `Contraseña no coincide`
            })
        }

        // Traer días de vigencia de parametros
        const diasVigencias = await Parametro.findOne({
            where:{
                PARAMETRO: 'ADMIN_DIAS_VIGENCIA'
            }
        });

        // Calcular fecha de vencimiento
        const fechaActual = new Date();
        const fechaVencimiento = (modificarDias(fechaActual, parseInt(diasVigencias.VALOR,10)));  

        // Crear usuario con el modelo
        DBusuario = await Usuario.build({
            USUARIO: usuario,
            NOMBRE_USUARIO: nombre_usuario,
            CONTRASENA :contrasena,
            CORREO_ELECTRONICO: correo,
            FECHA_VENCIMIENTO: fechaVencimiento,
        })

        // Hashear contraseña
        const salt = bcrypt.genSaltSync();
        DBusuario.CONTRASENA = bcrypt.hashSync(contrasena, salt);

        // Crear usuario de DB
        await DBusuario.save()

        //''''''''''''''''''''''' Guardar contraseña en historial ''''''''''''''''''''''''''

        // Llamar al usuario recien creado
        const usuarioCreado = await Usuario.findOne({where:{USUARIO: usuario}});

        historialContrasena = await HistorialContrasena.build({
            ID_USUARIO: usuarioCreado.ID_USUARIO,
            CONTRASENA: DBusuario.CONTRASENA
        })

        historialContrasena.save();

        // Traer ID del usuario creado
        const user = await Usuario.findOne({where:{USUARIO: usuario}});
        //Actualizar quién lo modifico y creo
        await Usuario.update({
            CREADO_POR: user.ID_USUARIO,
            MODIFICADO_POR: user.ID_USUARIO
        },{
            where:{
                ID_USUARIO: user.ID_USUARIO
            }
        })

        // ------------------ Mandar Correos ----------------------

        // Para enviar correos
        const transporte = await crearTransporteSMTP();

        // Parametros del mailer
        const correoSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_CORREO' }});
        const correoAdmin = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_CORREO'}});
        const nombreEmpresaSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_NOMBRE_EMPRESA' }});

        // Al usuario
        transporte.sendMail({
            from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR}>`, // Datos de emisor
	    	to: correo, // Receptor
	    	subject: "¡Cuenta creada! 🍔👌", // Asunto
	    	html: `<b>Bienvenido a Dr. Buger, su cuenta ha sido creada, contacte con el administrador para activar su cuenta</b>`
	    }, (err) => {
            if(err) { console.log( err ) };
        });

        // Al administrador
        transporte.sendMail({
            from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR}>`, // Datos de emisor
	    	to: correoAdmin.VALOR, // Receptor
	    	subject: "¡Nuevo usuario creado! 🍔👌", // Asunto
	    	html: `
            <b>Un nuevo usuario ha sido creado</b><br>
            <b>Usuario: <strong>${usuario}</strong></b><br>
            <b>Nombre del usuario: <strong>${nombre_usuario}</strong></b>
            <br>
            `
        }, (err) => {
            if(err) { console.log( err ) };
        })

        // Guardar evento
        eventBitacora(new Date, user.ID_USUARIO, 4, 'NUEVO', 'SE REGISTRO EL USUARIO '+usuario);

        // Generar respuesta exitosa
        return res.status(201).json({
            ok: true,
            msg: 'Registro éxitoso'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
}

const getUsuarios = async(req = request, res = response) => {
    let { limite = 10, desde = 0 } = req.query

    const { buscar = "" } = req.body;

    try {

        // Paginación
        const usuarios = await ViewUsuarios.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                // WHERE PREGUNTA LIKE %${BUSCAR}% OR LIKE %${BUSCAR}%
                [Op.or]: [{
                    USUARIO: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    NOMBRE_USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    ESTADO_USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    ROL: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CORREO_ELECTRONICO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });
        
        // Contar resultados total
        const countUsuarios = await ViewUsuarios.count()

        // Respuesta
        res.json( { usuarios, countUsuarios} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo usuario
const getUsuario = async (req = request, res = response) => {
     
    const { id_usuario } = req.params

    try {
        
        const usuario = await ViewUsuarios.findByPk( id_usuario );

        // Validar Existencia
        if( !usuario ){
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        res.json( usuario )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}


// Banear usuario
const bloquearUsuario = async (req = request, res = response) => {
     
    const { id_usuario, quienModifico } = req.params

    try {
        
        const usuario = await Usuarios.findByPk( id_usuario );

        // Validar Existencia
        if( !usuario ){
            return res.status(404).json({
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        // Actualizar db Pregunta
        await usuario.update({
            ESTADO_USUARIO: 'INACTIVO',
            MODIFICADO_POR: quienModifico
        }, {
            where: {
                ID_USUARIO: id_usuario
            }
        })

        // ------------------ Mandar Correos ----------------------

        // Para enviar correos
        const transporte = await crearTransporteSMTP();

        // Parametros del mailer
        const correoSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_CORREO' }});
        const nombreEmpresaSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_NOMBRE_EMPRESA' }});

        // Notificar Al usuario por correo
        transporte.sendMail({
            from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR.VALOR}>`, // Datos de emisor
	    	to: usuario.CORREO_ELECTRONICO, // Receptor
	    	subject: "Cuenta desactivada 🍔", // Asunto
	    	html: `<b>Su cuenta ha sido desactivada por el administrador</b><br>`
	    }, (err) => {
            if(err) { console.log( err ) };
        });

        eventBitacora(new Date, usuario.ID_USUARIO, 6, 'BLOQUEO', 'BLOQUEO DE USUARIO');

        res.json( usuario )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const putUsuario = async (req = request, res = response) => {
    const { id_usuario } = req.params
    const { usuario = "", nombre_usuario = "", correo = "", id_rol = "", estado = "", fechaVencimiento = "", quienModifico } = req.body;

    try {

        // Validar existencia
        const usuarioModelo = await Usuarios.findByPk( id_usuario );
        if( !usuarioModelo ){
            eventBitacora(new Date, quienModifico, 2, 'ACTUALIZACION', 'ACTUALIZACION DE DATOS SIN EXITO');
            return res.status(404).json({
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        // Actualizar db Usuario
        await usuarioModelo.update({
            USUARIO: usuario !== "" ? usuario : Usuario.USUARIO,
            NOMBRE_USUARIO: nombre_usuario !== "" ? nombre_usuario : Usuario.NOMBRE_USUARIO,
            ESTADO_USUARIO: estado !== "" ? estado : Usuario.ESTADO_USUARIO,
            CORREO_ELECTRONICO: correo !== "" ? correo : Usuario.CORREO_ELECTRONICO,
            ID_ROL: id_rol !== "" ? id_rol : Usuario.ID_ROL,
            FECHA_VENCIMIENTO: fechaVencimiento !== "" ? fechaVencimiento : Usuario.FECHA_VENCIMIENTO,
            MODIFICADO_POR: quienModifico
        }, {
            where: {
                ID_USUARIO: id_usuario
            }
        })
        eventBitacora(new Date, quienModifico, 2, 'ACTUALIZACION', 'ACTUALIZACION DE DATOS EXITOSO');
        res.json(usuarioModelo);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putContrasena = async (req = request, res = response) => {
    const { id_usuario } = req.params;
    let { contrasena, confirmContrasena, quienModifico } = req.body;

    try {

        // Validar que hagan match la confirmación de contraseña
        if( contrasena !== confirmContrasena ) {
            return res.status(401).json({
                ok: false,
                msg: `Contraseña no coincide`
            })
        }

        // Validar usuario inactivo
        const estado = await Usuario.findOne({where: {ID_USUARIO: id_usuario}})
        if(estado.ESTADO_USUARIO === 'INACTIVO'){
            eventBitacora(new Date, quienModifico, 12, 'ACTUALIZACION', 'ACTUALIZACION DE CONTRASEÑA NO PERMITIDA');
            return res.status(401).json({
                ok: false,
                msg: `El usuario ${estado.USUARIO}, no tiene permisos de cambiar la contraseña`
            })
        }

        // Validar si existe la misma contraseña en el historial de contraseñas
        const buscarContrasena = await HistorialContrasena.findAll({where: {ID_USUARIO: id_usuario}});
        for await (const contra of buscarContrasena){

            if (await bcrypt.compareSync( contrasena, contra.CONTRASENA )) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La contraseña ya existe en el historial'
                })
            }
        }

        // Hashear contraseña
        const salt = bcrypt.genSaltSync();
        contrasena = bcrypt.hashSync(contrasena, salt);

        // Validar existencia
        const usuario = await Usuarios.findByPk( id_usuario );
        if( !usuario ){
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        // Validar numero del historial
        const countContrasenas = await HistorialContrasena.count({where:{ID_USUARIO: id_usuario}});
        if (countContrasenas >= 10) {
            const primeraContrasena = await HistorialContrasena.findOne({order:["ID_HIST"], limit: 1})
            await primeraContrasena.destroy();
        }

        const historialContrasena = await HistorialContrasena.build({
            ID_USUARIO: id_usuario,
            CONTRASENA: contrasena
        })
        
        await historialContrasena.save();

        // ----------------- DEFINIR ESTADO --------------------

        // Traer el número de preguntas configuradas del usuario
        const countPreguntasUser = await PreguntaUsuario.count({where: {
            ID_USUARIO: id_usuario
        }})
        
        // Traer los parametros de número de preguntas
        const parametroNumPreguntas = await Parametro.findOne({
            where: {
                PARAMETRO: 'ADMIN_PREGUNTAS'
            }
        })
        
        
        // Si el usuario esta bloqueado, se activara, si tiene otro estado, se mantiene su estado
        if(usuario.ESTADO_USUARIO === 'BLOQUEADO' || usuario.ESTADO_USUARIO === 'NUEVO') {
            if(countPreguntasUser >= parametroNumPreguntas.VALOR) {
                usuario.ESTADO_USUARIO = 'ACTIVO'
            } else {
                usuario.ESTADO_USUARIO = 'NUEVO'
            }
        }

        // Asignar contraseña encryptada y reiniciar intentos
        usuario.CONTRASENA = contrasena;
        usuario.INTENTOS = 0;

        // Traer días de vigencia de parametros
        const diasVigencias = await Parametro.findOne({
            where:{
                PARAMETRO: 'ADMIN_DIAS_VIGENCIA'
            }
        });

        // ------------------- Actualizar fecha de vencimiento ------------------
        // Calcular fecha de vencimiento
        const fechaActual = new Date();
        const fechaVencimiento = (modificarDias(fechaActual, parseInt(diasVigencias.VALOR,10)));

        // Actualizar modificado por:
        usuario.MODIFICADO_POR = quienModifico;

        usuario.FECHA_VENCIMIENTO = fechaVencimiento;
        await usuario.save();

        eventBitacora(new Date, quienModifico, 12, 'ACTUALIZACION', 'ACTUALIZACION DE CONTRASEÑA EXITOSA');

        res.json({
            ok: true,
            usuario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

module.exports = {
    registrar,
    getUsuarios,
    getUsuario,
    bloquearUsuario,
    putContrasena,
    putUsuario
}
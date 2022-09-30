const { response, request } = require("express");
const Usuario = require("../../models/seguridad/usuario");
const bcrypt = require('bcryptjs');
const { generarJWT } = require("../../helpers/jwt");
const { resolveContent } = require("nodemailer/lib/shared");
const Parametro = require("../../models/seguridad/parametro");
const modificarDias = require("../../helpers/manipulacion-fechas");
const { Op, where } = require("sequelize");
const ViewUsuarios = require("../../models/seguridad/sql-vistas/view_usuario");
const Usuarios = require("../../models/seguridad/usuario");
const HistorialContrasena = require('../../models/seguridad/historial-contrena');
const { crearTransporteSMTP } = require("../../configs/nodemailer");
const PreguntaUsuario = require("../../models/seguridad/pregunta-usuario");


const registrar = async(req = request, res = response) => {

    const { usuario = "", nombre_usuario, contrasena, correo = "", rol } = req.body;

    try {

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
            ID_ROL: rol,
            CORREO_ELECTRONICO: correo,
            FECHA_VENCIMIENTO: fechaVencimiento,
        })

        // Hashear contraseña
        const salt = bcrypt.genSaltSync();
        DBusuario.CONTRASENA = bcrypt.hashSync(contrasena, salt);

        // Generar JWT
        // const token = await generarJWT(DBusuario.ID_USUARIO, '1h', process.env.SEMILLA_SECRETA_JWT_LOGIN)

        // Crear usuario de DB
        await DBusuario.save()

        // Llamar al usuario recien creado
        const usuarioCreado = await Usuario.findOne({where:{USUARIO: usuario}});

        historialContrasena = await HistorialContrasena.build({
            ID_USUARIO: usuarioCreado.ID_USUARIO,
            CONTRASENA: DBusuario.CONTRASENA
        })

        historialContrasena.save();

        const user = await Usuario.findOne({where:{USUARIO: usuario}});

        await Usuario.update({
            CREADO_POR: user.ID_USUARIO,
            MODIFICADO_POR: user.ID_USUARIO

        },{
            where:{
                ID_USUARIO: user.ID_USUARIO
            }
        })

        // Para enviar correos
        const transporte = await crearTransporteSMTP();

        // Al usuario
        await transporte.sendMail({
            from: '"Dr. Burger 🍔" <drburger.safi.mailer@gmail.com>', // sender address
	    	to: "kevin.cubas.hn@outlook.com", // list of receivers
	    	subject: "¡Cuenta creada! 🍔👌", // Subject line
	    	text: "Bienvenido a Dr. Buger, su cuenta ha sido creada, contacte con el administrador para activar su cuenta", // plain text body
	    	html: `<br> Embedded image: <img src="cid:unique@kreata.ee"/>`,
	    	attachments: [{
	    		filename: 'image.png',
	    		path: './src/assets/svg/foto2.png',
	    		cid: 'unique@kreata.ee' //same cid value as in the html img src
	    	}]
	    });
        // Al administrador
        await transporte.sendMail({
            from: '"Dr. Burger 🍔" <drburger.safi.mailer@gmail.com>', // sender address
	    	to: "drburger.safi.mailer@gmail.com", // list of receivers
	    	subject: "¡Nuevo usuario creado! 🍔👌", // Subject line
	    	text: "Un nuevo usuario ha sido creado", // plain text body
	    	html: `
            <b>Usuario: <strong>${usuario}</strong></b><br>
            <b>Nombre del usuario: <strong>${nombre_usuario}</strong></b>
            <br> Embedded image: <img src="cid:unique@kreata.ee"/>
            `,
	    	attachments: [{
	    		filename: 'image.png',
	    		path: './src/assets/svg/foto2.png',
	    		cid: 'unique@kreata.ee' //same cid value as in the html img src
	    	}]
        })

        // Generar respuesta exitosa
        return res.status(201).json({
            ok: true,
            uid: DBusuario.id,
            usuario, 
            nombre_usuario,  
            rol, 
            correo,
            // token
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
     
    const { id_usuario } = req.params

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
            ESTADO_USUARIO: 'INACTIVO'
        }, {
            where: {
                ID_USUARIO: id_usuario
            }
        })

        // Para enviar correos
        const transporte = await crearTransporteSMTP();

        // Notificar Al usuario por correo
        await transporte.sendMail({
            from: '"Dr. Burger 🍔" <drburger.safi.mailer@gmail.com>', // sender address
	    	to: "kevin.cubas.hn@outlook.com", // list of receivers
	    	subject: "Cuenta desactivada 🍔", // Subject line
	    	text: "Su cuenta ha sido desactivada por el administrador", // plain text body
	    	html: `<br> Embedded image: <img src="cid:unique@kreata.ee"/>`,
	    	attachments: [{
	    		filename: 'image.png',
	    		path: './src/assets/svg/foto2.png',
	    		cid: 'unique@kreata.ee' //same cid value as in the html img src
	    	}]
	    });

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
    const { usuario = "", nombre_usuario = "", correo = "", id_rol = "", estado = "", fecha_ultima_conexion = "", fechaVencimiento = "" } = req.body;

    try {

        // Validar existencia
        const usuarioModelo = await Usuarios.findByPk( id_usuario );
        if( !usuarioModelo ){
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
            FECHA_ULTIMA_CONEXION: fecha_ultima_conexion !== "" ? fecha_ultima_conexion : Usuario.FECHA_ULTIMA_CONEXION
        }, {
            where: {
                ID_USUARIO: id_usuario
            }
        })

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
    let { contrasena, confirmContrasena } = req.body;

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
        if(usuario.ESTADO_USUARIO === 'BLOQUEADO') {
            if(countPreguntasUser >= parametroNumPreguntas.VALOR) {
                usuario.ESTADO_USUARIO = 'ACTIVO'
            } else {
                usuario.ESTADO_USUARIO = 'NUEVO'
            }
        }

        usuario.CONTRASENA = contrasena;
        usuario.INTENTOS = 0;

        // Traer días de vigencia de parametros
        const diasVigencias = await Parametro.findOne({
            where:{
                PARAMETRO: 'ADMIN_DIAS_VIGENCIA'
            }
        });

        // Calcular fecha de vencimiento
        const fechaActual = new Date();
        const fechaVencimiento = (modificarDias(fechaActual, parseInt(diasVigencias.VALOR,10)));

        usuario.FECHA_VENCIMIENTO = fechaVencimiento
        await usuario.save();

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
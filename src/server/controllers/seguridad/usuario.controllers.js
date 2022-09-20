const { response, request } = require("express");
const Usuario = require("../../models/seguridad/usuario");
const bcrypt = require('bcryptjs');
const { generarJWT } = require("../../helpers/jwt");
const { resolveContent } = require("nodemailer/lib/shared");
const Parametro = require("../../models/seguridad/parametro");
const modificarDias = require("../../helpers/manipulacion-fechas");
const { Op } = require("sequelize");
const ViewUsuarios = require("../../models/seguridad/sql-vistas/view_usuario");
const Usuarios = require("../../models/seguridad/usuario");
const HistorialContrasena = require('../../models/seguridad/historial-contrena');

const registrar = async(req = request, res = response) => {

    const { usuario = "", nombre_usuario, contrasena, correo = "", rol, fecha_ultima_conexion } = req.body;

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
            FECHA_ULTIMA_CONEXION: fecha_ultima_conexion
        })

        // Hashear contraseña
        const salt = bcrypt.genSaltSync();
        DBusuario.CONTRASENA = bcrypt.hashSync(contrasena, salt);

        // Generar JWT
        const token = await generarJWT(DBusuario.id, usuario)

        // Crear usuario de DB
        await DBusuario.save()

        // Llamar al usuario recien creado
        const usuarioCreado = await Usuario.findOne({where:{USUARIO: usuario}});

        console.log(usuarioCreado)
        historialContrasena = await HistorialContrasena.build({
            ID_USUARIO: usuarioCreado.ID_USUARIO,
            CONTRASENA: DBusuario.CONTRASENA
        })

        historialContrasena.save();

        // Generar respuesta exitosa
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
            ESTADO_USUARIO: 'BLOQUEADO'
        }, {
            where: {
                ID_USUARIO: id_usuario
            }
        })


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
    const { usuario, nombre_usuario, correo, id_rol, estado, fecha_ultima_conexion, fechaVencimiento } = req.body;

    try {

        // Validar existencia
        const usuarioModelo = await Usuarios.findByPk( id_usuario );
        if( !usuarioModelo ){
            return res.status(404).json({
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        // Actualizar db Pregunta
        await usuarioModelo.update({
            USUARIO: usuario,
            NOMBRE_USUARIO: nombre_usuario,
            ESTADO_USUARIO: estado,
            CORREO_ELECTRONICO: correo,
            ID_ROL: id_rol,
            FECHA_VENCIMIENTO: fechaVencimiento,
            FECHA_ULTIMA_CONEXION: fecha_ultima_conexion
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
    const { id_usuario } = req.params
    let { contrasena } = req.body;

    try {
        // Validar si existe la misma contraseña en el historial de contraseñas
        const buscarContrasena = await HistorialContrasena.findAll({where: {ID_USUARIO: id_usuario}});
        for await (const contra of buscarContrasena){

            if (await bcrypt.compareSync( contrasena, contra.CONTRASENA )) {
                return res.status(400).json({
                    msg: 'La contraseña ' + contrasena + ' ya existe en el historial'
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
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        // Validar numero del historial
        const countContrasenas = await HistorialContrasena.count({where:{ID_USUARIO: id_usuario}});
        if (countContrasenas >= 10) {
            const primeraContrasena = await HistorialContrasena.findOne({order:["ID_HIST"], limit: 1})
            await primeraContrasena.destroy();
        }

        // Actualizar db Usuario
        await usuario.update({
            CONTRASENA: contrasena
        }, {
            where: {
                ID_USUARIO: id_usuario
            }
        })

        const historialContrasena = await HistorialContrasena.build({
            ID_USUARIO: id_usuario,
            CONTRASENA: contrasena
        })
        
        await historialContrasena.save();
        

        res.json(usuario);

    } catch (error) {
        console.log(error);
        res.status(500).json({
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
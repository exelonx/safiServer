const { request, response } = require('express');
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize');
const Notificacion = require('../../models/notificacion/notificacion');
const NotificacionUsuario = require('../../models/notificacion/notificacion_usuario');
const PermisoNotificacion = require('../../models/notificacion/permiso_notificacion');
const ViewNotificacionUsuario = require('../../models/notificacion/sql-vistas/view_notificacion_usuario');
const TipoNotificacion = require('../../models/notificacion/tipo_notificacion');
const Roles = require('../../models/seguridad/rol');
const Usuarios = require('../../models/seguridad/Usuario');

const getNotificacionesCampana = async (req = request, res = response) => {
    
    let { limite = 10, desde = 0 } = req.query
    const token = req.header('x-token')

    try {
        console.log(limite, desde)
        // Extraer el id del usuario
        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_LOGIN );

        // Traer todas las notificaciones del usuario por el id usuario
        const notificaciones = await ViewNotificacionUsuario.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
            ID_USUARIO: uid
        }})

        res.json({
            ok: true,
            notificaciones
        })
    } catch (error) {
        if(error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                ok: false,
                msg: 'Token inválido'
            })
        } else {
            console.log(error);
            res.status(500).json({
                ok: false,
                msg: error.message
            })
        }
    }
}

const postNotificacion = async (req = request, res = response) => {
    const { idTipoNotificacion, accion, detalle } = req.body;

    try {
        
        // Crear Notificación
        const notificacion = await Notificacion.create({
            ID_TIPO_NOTIFICACION: idTipoNotificacion,
            ACCION: accion,
            DETALLE: detalle
        })
    
        // Traer todos los roles con permisos
        const permisos = await PermisoNotificacion.findAll({where: {
            ID_TIPO_NOTIFICACION: idTipoNotificacion,
            RECIBIR_NOTIFICACION: true
        }})
    
        // Recorrer todos los permisos que tienen permiso
        for await ( let permiso of permisos ) {
    
            // Traer todos los usuarios que tengan el rol con permiso y que esten activos
            let usuarios = await Usuarios.findAll( 
                {where: 
                    { 
                        ID_ROL: permiso.ID_ROL, 
                        ESTADO_USUARIO: {[Op.or]: ['ACTIVO', 'BLOQUEADO']} // Deben estar activos o bloqueados para recibir notificaciones
                    } 
                }
            )
            
            // Recorrer cada uno de los usuarios
            for await ( let usuario of usuarios ) {
                // Crear notificación para cada usuario con privilegio
                NotificacionUsuario.create({
                    ID_USUARIO: usuario.ID_USUARIO,
                    ID_NOTIFICACION: notificacion.id
                })
            }
        }
    
        // Buscar que roles tienen permisos de ver
    
        res.json({
            ok: true,
            notificacion
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const configPermisosInicialesNoti = async (req = request, res = response) => {

    // Traer todos los roles
    const roles = await Roles.findAll();
    // Traer todos los tipos de notificaciones
    const tipoNotificaciones = await TipoNotificacion.findAll();

    // Recorrer todos los roles
    for await (let rol of roles) {

        // Buscar que roles no tienen permisos de notificaciones
        if( !(await PermisoNotificacion.findOne({ where: { ID_ROL: rol.ID_ROL } })) ) {
            
            // Si el rol es el de administrador darle privilegios máximos
            if ( rol.ID_ROL === 1 ) {

                // Configurar todos los permisos por cada tipo de notificacion
                for await ( let tipo of tipoNotificaciones ) {
                    await PermisoNotificacion.create({
                        ID_ROL: rol.ID_ROL,
                        ID_TIPO_NOTIFICACION: tipo.id,
                        RECIBIR_NOTIFICACION: true,
                        CREADO_POR: 1,
                        MODIFICADO_POR: 1
                    })

                }

            } else {

            // Configurar todos los permisos por cada tipo de notificacion
            // PERO SIN PRIVILEGIOS
            for await ( let tipo of tipoNotificaciones ) {
                await PermisoNotificacion.create({
                    ID_ROL: rol.ID_ROL,
                    ID_TIPO_NOTIFICACION: tipo.id,
                    RECIBIR_NOTIFICACION: false,
                    CREADO_POR: 1,
                    MODIFICADO_POR: 1
                })

            }

            }

        }
    }

    // Buscar que roles tienen permisos de ver

    res.json({
        ok: true
    })
}

module.exports = {
    getNotificacionesCampana,
    postNotificacion,
    configPermisosInicialesNoti
}
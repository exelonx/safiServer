const { request, response } = require('express');
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize');
const { instanciarServidor } = require('../../helpers/instanciarServer');
const Notificacion = require('../../models/notificacion/notificacion');
const NotificacionUsuario = require('../../models/notificacion/notificacion_usuario');
const PermisoNotificacion = require('../../models/notificacion/permiso_notificacion');
const ViewNotificacionUsuario = require('../../models/notificacion/sql-vistas/view_notificacion_usuario');
const ViewPermisoNotificacion = require('../../models/notificacion/sql-vistas/view_permiso_notificacion');
const TipoNotificacion = require('../../models/notificacion/tipo_notificacion');
const Parametro = require('../../models/seguridad/parametro');
const Roles = require('../../models/seguridad/rol');
const Usuarios = require('../../models/seguridad/Usuario');

const getNotificacionesCampana = async (req = request, res = response) => {
    
    let { limite = 10, desde = 0 } = req.query
    const token = req.header('x-token')

    try {
        // Extraer el id del usuario
        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_LOGIN );

        // Traer todas las notificaciones del usuario por el id usuario
        const notificaciones = await ViewNotificacionUsuario.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
            ID_USUARIO: uid
        }})

        const cantidadNoVistas = await NotificacionUsuario.count({
            where: {
                VISTO: false,
                ID_USUARIO: uid
        }})

        res.json({
            ok: true,
            notificaciones,
            cantidadNoVistas
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
    const { idTipoNotificacion, accion, detalle, id_responsable, id_insumo } = req.body;

    try {

        if(idTipoNotificacion === 1) {
            if(!id_insumo || id_insumo === "") {
                return res.status(404).json({
                    ok: false,
                    msg: 'El insumo es obligatorio en notificaciones de inventario'
                })
            }
        }

        if(idTipoNotificacion === 2) {
            if(!id_responsable || id_insumo === "") {
                return res.status(404).json({
                    ok: false,
                    msg: 'El responsable es obligatorio en notificaciones de pedido'
                })
            }
        }
        
        // Crear Notificación
        const notificacion = await Notificacion.create({
            ID_TIPO_NOTIFICACION: idTipoNotificacion,
            ACCION: accion,
            DETALLE: detalle,
            ID_RESPONSABLE: id_responsable !== "" ? id_responsable : null,
            ID_INSUMO: id_insumo !== "" ? id_insumo : null
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

        const id_notificacion = notificacion.id

        const payload = {
            permisos,
            id_notificacion
        }

        
        res.json({
            ok: true,
            // notificacion
        })

        // Instanciar el servidor singletone
        const server = instanciarServidor();
        // Notificar que se creo nueva notificación y mandar lista de permisos para avisar que roles recibiran la notificacion
        server.io.emit('notificar', payload)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const recibirNotificacion = async (req = request, res = response) => {
    let { id_notificacion } = req.params;
    const token = req.header('x-token');

    try {
        // Extraer el id del usuario
        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_LOGIN );
        let nuevaNotificacion
        
        // Traer la nueva notificación del usuario
        do {
            nuevaNotificacion = await ViewNotificacionUsuario.findOne({
                where: {
                    ID_USUARIO: uid,
                    ID_NOTIFICACION: id_notificacion
                }
            })
        } while (!nuevaNotificacion);
         
        // Enviar notificación
        res.json({
            nuevaNotificacion
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

const verNotificacion = async (req = request, res = response) => {
    let { id_notificacion } = req.params
    const token = req.header('x-token')

    try {

        if(isNaN(id_notificacion)) {
            return res.status(400).json({
                ok: false,
                msg: 'id inválido'
            })
        }

        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_LOGIN );

        const notificacion = await ViewNotificacionUsuario.findOne({
            where: {
                ID: id_notificacion,
                ID_USUARIO: uid 
            }
        })

        if(!notificacion) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe la notificación'
            })
        }

        // Marcar como vista la notificación
        const notificacionTBL = await NotificacionUsuario.findOne({
            where: {
                ID: id_notificacion,
                ID_USUARIO: uid 
            }
        })

        // Solo si no estan vistas
        if(!notificacionTBL.VISTO) {
            notificacionTBL.VISTO = true;
            await notificacionTBL.save()
        }
        
        const cantidadNoVistas = await NotificacionUsuario.count({
            where: {
                VISTO: false,
                ID_USUARIO: uid
        }})

        return res.json({
            ok: true,
            notificacion,
            cantidadNoVistas
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const getTipoNotificacion = async (req = request, res = response) => {
    try {
        
        const tipoNotificacion = await TipoNotificacion.findAll();
        res.json({tipoNotificacion})

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const getPermisosNotificaciones = async (req = request, res = response) => {
    let {limite, desde = 0, buscar = "", id_usuario, id_rol = "", id_tipo = ""} = req.query;
    let filtrarPorRol = {}
    let filtrarPorTipo = {}
    try {

         // Definir el número de objetos a mostrar
         if(!limite || limite === "") {
            const { VALOR } = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
            limite = VALOR
        }

        if(desde === "") {
            desde = 0
        }

        if( id_rol !== '' ) {
            filtrarPorRol = {
                ID_ROL: id_rol
            }
        }

        if( id_tipo !== '' ) {
            filtrarPorTipo = {
                ID_TIPO_NOTIFICACION: id_tipo
            }
        }

        //Paginacion
        const permisos = await ViewPermisoNotificacion.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where:{
                [Op.or]: [{
                    ROL: {[Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    TIPO_NOTIFICACION: {[Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }],
                [Op.and]: [filtrarPorRol, filtrarPorTipo]
            }
        });

        const countPermisos = await ViewPermisoNotificacion.count({
            where:{
                [Op.or]: [{
                    ROL: {[Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    TIPO_NOTIFICACION: {[Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }],
                [Op.and]: [filtrarPorRol, filtrarPorTipo]
            }
        });
        
        res.json({limite, countPermisos, permisos})

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

module.exports = {
    getNotificacionesCampana,
    postNotificacion,
    recibirNotificacion,
    configPermisosInicialesNoti,
    verNotificacion,
    getTipoNotificacion,
    getPermisosNotificaciones
}
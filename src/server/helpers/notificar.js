const { Op } = require("sequelize")
const Notificacion = require("../models/notificacion/notificacion")
const NotificacionUsuario = require("../models/notificacion/notificacion_usuario")
const PermisoNotificacion = require("../models/notificacion/permiso_notificacion")
const Usuarios = require("../models/seguridad/usuario")
const { instanciarServidor } = require("./instanciarServer")

const notificar = async ( idTipoNotificacion, accion, detalle, id_responsable, id_insumo ) => {

    try {
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

        // Armar el payload
        const id_notificacion = notificacion.id

        const payload = {
            permisos,
            id_notificacion
        }

        // Instanciar el servidor singletone
        const server = instanciarServidor();
        // Notificar que se creo nueva notificación y mandar lista de permisos para avisar que roles recibiran la notificacion
        server.io.emit('notificar', payload)

    } catch (error) {
        console.log(error)
    }

}

const emitEventoInventario = async ( evento ) => {
    // Instanciar el servidor singletone
    const server = instanciarServidor();
    server.io.emit('recargarInventario')
}

module.exports = {
    notificar,
    emitEventoInventario
}
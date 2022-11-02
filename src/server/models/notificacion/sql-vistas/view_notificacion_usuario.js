const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewNotificacionUsuario = db.define(`VIEW_MN_NOTIFICACION_USUARIO`, {
    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    USUARIO: {
        type: DataTypes.STRING
    },
    ID_NOTIFICACION: {
        type: DataTypes.INTEGER
    },
    ACCION:{
        type: DataTypes.STRING
    },
    DETALLE: {
        type: DataTypes.STRING
    },
    TIEMPO_TRANSCURRIDO: {
        type: DataTypes.DATE
    },
    ID_TIPO_NOTIFICACION: {
        type: DataTypes.INTEGER
    },
    TIPO_NOTIFICACION: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'VIEW_MN_NOTIFICACION_USUARIO',
    timestamps: false,
})

module.exports = ViewNotificacionUsuario;
const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewPermisoNotificacion = db.define(`VIEW_MN_PERMISO`, {
    ID: {
        type: DataTypes.NUMBER
    },
    ID_ROL: {
        type: DataTypes.INTEGER
    },
    ROL: {
        type: DataTypes.STRING
    },
    ID_TIPO_NOTIFICACION: {
        type: DataTypes.INTEGER
    },
    TIPO_NOTIFICACION: {
        type: DataTypes.STRING
    },
    RECIBIR_NOTIFICACION: {
        type: DataTypes.BOOLEAN
    },
    ID_CREADO_POR: {
        type: DataTypes.INTEGER
    },
    CREADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_CREACION: {
        type: DataTypes.DATE
    },
    ID_MODIFICADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'VIEW_MN_PERMISO',
    timestamps: false,
})

module.exports = ViewPermisoNotificacion;
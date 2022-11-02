const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const PermisoNotificacion = db.define(`TBL_MN_PERMISO`, {
    ID_ROL: {
        type: DataTypes.INTEGER
    },
    ID_TIPO_NOTIFICACION: {
        type: DataTypes.INTEGER
    },
    RECIBIR_NOTIFICACION: {
        type: DataTypes.BOOLEAN
    },
    CREADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'TBL_MN_PERMISO',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})

//Para exportar el modelo
module.exports = PermisoNotificacion;
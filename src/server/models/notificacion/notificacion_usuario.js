const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const NotificacionUsuario = db.define(`TBL_MN_NOTIFICACION_USUARIO`, {
    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    ID_NOTIFICACION: {
        type: DataTypes.INTEGER
    },
    VISTO: {
        type: DataTypes.BOOLEAN
    }
}, {
    tableName: 'TBL_MN_NOTIFICACION_USUARIO',
    timestamps: false
})

//Para exportar el modelo
module.exports = NotificacionUsuario;
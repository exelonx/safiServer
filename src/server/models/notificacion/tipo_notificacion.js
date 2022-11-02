const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const TipoNotificacion = db.define(`TBL_MN_TIPO_NOTIFICACION`, {
    TIPO_NOTIFICACION: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MN_TIPO_NOTIFICACION',
    timestamps: false
})

//Para exportar el modelo
module.exports = TipoNotificacion;
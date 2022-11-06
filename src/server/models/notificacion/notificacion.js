const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Notificacion = db.define(`TBL_MN_NOTIFICACION`, {
    ID_TIPO_NOTIFICACION: {
        type: DataTypes.INTEGER
    },
    ID_RESPONSABLE: {
        type: DataTypes.INTEGER
    },
    ID_INSUMO: {
        type: DataTypes.INTEGER
    },
    ACCION: {
        type: DataTypes.STRING
    },
    DETALLE: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MN_NOTIFICACION',
    timestamps: false
})

//Para exportar el modelo
module.exports = Notificacion;
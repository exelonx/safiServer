const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const DetalleHistorial = db.define(`TBL_MP_DETALLE_HISTORIAL`, {

    ID_DETALLE: {
        type: DataTypes.INTEGER
    },
    PRODUCTO_ANTERIOR: {
        type: DataTypes.STRING
    },
    HORA_CAMBIO: {
        type: DataTypes.DATE
    },
    CONFIRMADO: {
        type: DataTypes.BOOLEAN
    }
}, {
    tableName: 'TBL_MP_DETALLE_HISTORIAL',
    timestamps: false,
    
})


//Para exportar el modelo
module.exports = DetalleHistorial;
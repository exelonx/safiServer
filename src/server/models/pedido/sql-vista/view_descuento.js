const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewDescuento= db.define(`VIEW_MF_DESCUENTO`, {

    ID: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    CANTIDAD: {
        type: DataTypes.INTEGER
    },
    ID_TIPO_DESCUENTO: {
        type: DataTypes.INTEGER
    },
    DETALLE: {
        type: DataTypes.STRING
    },
    ES_PORCENTAJE: {
        type: DataTypes.BOOLEAN
    }
}, {
    tableName: 'VIEW_MF_DESCUENTO',
    timestamps: false,
})


//Para exportar el modelo
module.exports = ViewDescuento;
const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const CompraDetalle = db.define(`TBL_MI_DETALLE_COMPRA`, {
    ID: {
        type: DataTypes.INTEGER, 
        primaryKey: true
    },
    ID_COMPRA: {
        type: DataTypes.INTEGER
    },
    ID_INSUMO: {
        type: DataTypes.INTEGER
    },
    CANTIDAD: {
        type: DataTypes.INTEGER
    },
    PRECIO_COMPRA: {
        type: DataTypes.DECIMAL
    }
}, {
    tableName: 'TBL_MI_DETALLE_COMPRA',
    timestamps: false
})

//Para exportar el modelo
module.exports = CompraDetalle;
const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')

const ViewCompraDetalle = db.define(`VIEW_MI_DETALLE_COMPRA`, {
    ID: {
        type: DataTypes.INTEGER
    },
    PROVEEDOR: {
        type: DataTypes.STRING
    },
    ID_COMPRA: {
        type: DataTypes.INTEGER
    },
    ID_INSUMO: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    CANTIDAD: {
        type: DataTypes.INTEGER
    },
    PRECIO_COMPRA: {
        type: DataTypes.DECIMAL
    },
    SUBTOTAL: {
        type: DataTypes.DECIMAL
    },
    TOTAL: {
        type: DataTypes.DECIMAL
    }
}, {
    tableName: 'VIEW_MI_DETALLE_COMPRA',
    timestamps: false
})

//Para exportar el modelo
module.exports = ViewCompraDetalle;
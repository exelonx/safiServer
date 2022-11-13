const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewCompra = db.define(`VIEW_MI_COMPRA`, {
    ID: {
        type: DataTypes.NUMBER
    },
    ID_PROVEEDOR: {
        type: DataTypes.INTEGER
    },
    PROVEEDOR: {
        type: DataTypes.STRING
    },
    TOTAL_PAGADO: {
        type: DataTypes.DECIMAL
    },
    FECHA: {
        type: DataTypes.DATE
    },
    CREADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_CREACION: {
        type: DataTypes.DATE
    },
    MODIFICADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'VIEW_MI_COMPRA',
    timestamps: false,
})

module.exports = ViewCompra;
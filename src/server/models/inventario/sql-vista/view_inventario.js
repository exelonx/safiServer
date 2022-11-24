const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')

const ViewInventario = db.define(`VIEW_MI_INVENTARIO`, {
    ID: {
        type: DataTypes.INTEGER
    },
    ID_INSUMO: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    UNIDAD_MEDIDA: {
        type: DataTypes.STRING
    },
    EXISTENCIA: {
        type: DataTypes.DECIMAL
    },
    CANTIDAD_MAXIMA: {
        type: DataTypes.INTEGER
    },
    CANTIDAD_MINIMA: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'VIEW_MI_INVENTARIO',
    timestamps: false,
})

//Para exportar el modelo
module.exports = ViewInventario;
const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewInsumoProducto = db.define(`VIEW_MI_INSUMO_PRODUCTO`, {

    ID: {
        type: DataTypes.INTEGER
    },
    ID_INSUMO: {
        type: DataTypes.INTEGER
    },
    NOMBRE_INSUMO: {
        type: DataTypes.STRING
    },
    ID_PRODUCTO: {
        type: DataTypes.INTEGER
    },
    NOMBRE_PRODUCTO: {
        type: DataTypes.STRING
    },
    CANTIDAD: {
        type: DataTypes.DECIMAL
    },
}, {
    tableName: 'VIEW_MI_INSUMO_PRODUCTO',
    timestamps: false,
})




//Para exportar el modelo
module.exports = ViewInsumoProducto;
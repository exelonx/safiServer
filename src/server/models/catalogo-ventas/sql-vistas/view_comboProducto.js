const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewComboProducto = db.define(`VIEW_MP_COMBO_PRODUCTO`, {

    ID: {
        type: DataTypes.INTEGER
    },
    ID_COMBO: {
        type: DataTypes.INTEGER
    },
    NOMBRE_COMBO: {
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
    tableName: 'VIEW_MP_COMBO_PRODUCTO',
    timestamps: false,
})




//Para exportar el modelo
module.exports = ViewComboProducto;
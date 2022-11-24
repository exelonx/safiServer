const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const ComboProducto = db.define(`TBL_MP_COMBO_PRODUCTO`, {

    ID_COMBO: {
        type: DataTypes.INTEGER
    },
    ID_PRODUCTO: {
        type: DataTypes.INTEGER
    },
    CANTIDAD: {
        type: DataTypes.DECIMAL
    },
}, {
    tableName: 'TBL_MP_COMBO_PRODUCTO',
    timestamps: false
})




//Para exportar el modelo
module.exports = ComboProducto;
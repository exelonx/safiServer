const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const InsumoProducto = db.define(`TBL_MI_INSUMO_PRODUCTO`, {

    ID_INSUMO: {
        type: DataTypes.INTEGER
    },
    ID_PRODUCTO: {
        type: DataTypes.INTEGER
    },
    CANTIDAD: {
        type: DataTypes.DECIMAL
    },
}, {
    tableName: 'TBL_MI_INSUMO_PRODUCTO',
    timestamps: false
})




//Para exportar el modelo
module.exports = InsumoProducto;
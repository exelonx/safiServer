const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewPromocionProducto = db.define(`VIEW_MP_PROMOCION_PRODUCTO`, {

    ID: {
        type: DataTypes.INTEGER
    },
    ID_PROMOCION: {
        type: DataTypes.INTEGER
    },
    NOMBRE_PROMOCION: {
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
    tableName: 'VIEW_MP_PROMOCION_PRODUCTO',
    timestamps: false,
})




//Para exportar el modelo
module.exports = ViewPromocionProducto;
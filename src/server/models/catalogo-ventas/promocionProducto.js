const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const PromocionProducto = db.define(`TBL_MP_PROMOCION_PRODUCTO`, {

    ID_PROMOCION: {
        type: DataTypes.INTEGER
    },
    ID_PRODUCTO: {
        type: DataTypes.INTEGER
    },
    CANTIDAD: {
        type: DataTypes.INTEGER
    },
}, {
    tableName: 'TBL_MP_PROMOCION_PRODUCTO',
    timestamps: false
})




//Para exportar el modelo
module.exports = PromocionProducto;
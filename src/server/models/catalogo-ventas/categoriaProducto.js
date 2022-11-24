const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const CatalogoProducto = db.define(`TBL_MP_CATALOGO_VENTA`, {

    ID_CATALOGO: {
        type: DataTypes.INTEGER
    },
    ID_PRODUCTO: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'TBL_MP_CATALOGO_VENTA',
    timestamps: false
})




//Para exportar el modelo
module.exports = CatalogoProducto;
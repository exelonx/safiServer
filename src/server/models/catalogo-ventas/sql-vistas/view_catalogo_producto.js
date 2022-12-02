const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')

const ViewCatalogoProducto = db.define(`VIEW_MP_CATALOGO_PRODUCTO`, {

    ID: {
        type: DataTypes.INTEGER
    },
    ID_CATALOGO: {
        type: DataTypes.INTEGER
    },
    NOMBRE_CATALOGO: {
        type: DataTypes.STRING
    },
    ID_PRODUCTO: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'VIEW_MP_CATALOGO_PRODUCTO',
    timestamps: false,
})




//Para exportar el modelo
module.exports = ViewCatalogoProducto;
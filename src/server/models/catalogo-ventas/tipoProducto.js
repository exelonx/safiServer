const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const TipoProducto = db.define(`TBL_MP_TIPO_PRODUCTO`, {

    TIPO_PRODUCTO: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MP_TIPO_PRODUCTO',
    timestamps: false,
})


//Para exportar el modelo
module.exports = TipoProducto;
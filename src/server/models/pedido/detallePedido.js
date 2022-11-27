const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const DetallePedido = db.define(`TBL_MP_PEDIDO_DETALLE`, {

    ID_PEDIDO: {
        type: DataTypes.INTEGER
    },
    ID_PRODUCTO: {
        type: DataTypes.INTEGER
    },
    ID_ESTADO: {
        type: DataTypes.INTEGER
    },
    PARA_LLEVAR: {
        type: DataTypes.INTEGER
    },
    CANTIDAD: {
        type: DataTypes.INTEGER
    },
    HORA: {
        type: DataTypes.DATE
    },
    TOTAL_IMPUESTO: {
        type: DataTypes.DECIMAL
    },
    PORCENTAJE_IMPUESTO: {
        type: DataTypes.INTEGER
    },
    PRECIO_DETALLE: {
        type: DataTypes.DECIMAL
    },
    INFORMACION: {
        type: DataTypes.STRING
    },
}, {
    tableName: 'TBL_MP_PEDIDO_DETALLE',
    timestamps: false
})


//Para exportar el modelo
module.exports = DetallePedido;
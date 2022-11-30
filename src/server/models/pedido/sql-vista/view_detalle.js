const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewDetallePedido = db.define(`VIEW_MP_PEDIDO_DETALLE`, {

    ID: {
        type: DataTypes.INTEGER
    },
    ID_PEDIDO: {
        type: DataTypes.INTEGER
    },
    MESA: {
        type: DataTypes.STRING
    },
    ID_PRODUCTO: {
        type: DataTypes.INTEGER
    },
    NOMBRE_PRODUCTO: {
        type: DataTypes.STRING
    },
    PRECIO_PRODUCTO: {
        type: DataTypes.DECIMAL
    },
    DESCRIPCION: {
        type: DataTypes.STRING
    },
    EXENTA: {
        type: DataTypes.BOOLEAN
    },
    ID_ESTADO: {
        type: DataTypes.INTEGER
    },
    ESTADO: {
        type: DataTypes.STRING
    },
    COLOR: {
        type: DataTypes.STRING
    },
    CANTIDAD: {
        type: DataTypes.INTEGER
    },
    PARA_LLEVAR: {
        type: DataTypes.BOOLEAN
    },
    HORA: {
        type: DataTypes.DATE
    },
    INFORMACION: {
        type: DataTypes.STRING
    },
    PRECIO_DETALLE: {
        type: DataTypes.DECIMAL
    },
    TOTAL_IMPUESTO: {
        type: DataTypes.DECIMAL
    },
    PORCENTAJE_IMPUESTO: {
        type: DataTypes.INTEGER
    },
    ID_IMPUESTO: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'VIEW_MP_PEDIDO_DETALLE',
    timestamps: false,
})


//Para exportar el modelo
module.exports = ViewDetallePedido;
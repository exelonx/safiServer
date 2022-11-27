const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewPedido = db.define(`VIEW_MP_PEDIDO`, {
    ID: {
        type: DataTypes.INTEGER
    },
    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    USUARIO: {
        type: DataTypes.STRING
    },
    NOMBRE_USUARIO: {
        type: DataTypes.STRING
    },
    ID_ESTADO: {
        type: DataTypes.INTEGER
    },
    ID_MESA: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    ID_CAJA: {
        type: DataTypes.INTEGER
    },
    SUBTOTAL: {
        type: DataTypes.DECIMAL
    },
    NOMBRE_CLIENTE: {
        type: DataTypes.STRING
    },
    HORA_SOLICITUD: {
        type: DataTypes.DATE
    },
    HORA_FINALIZACION: {
        type: DataTypes.DATE
    },
    MODIFICADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'VIEW_MP_PEDIDO',
    timestamps: false,
})

module.exports = ViewPedido;
const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Pedido = db.define(`TBL_MP_PEDIDO`, {

    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    ID_ESTADO: {
        type: DataTypes.INTEGER
    },
    ID_MESA: {
        type: DataTypes.INTEGER
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
    HORA_FINALIZACION: {
        type: DataTypes.DATE
    },
    MODIFICADO_POR: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MP_PEDIDO',
    timestamps: true,
    createdAt: 'HORA_SOLICITUD',
    updatedAt: 'FECHA_MODIFICACION'
})


//Para exportar el modelo
module.exports = Pedido;
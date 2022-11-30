const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Factura = db.define(`TBL_MF_FACTURA`, {
    ID_PEDIDO: {
        type: DataTypes.INTEGER
    },
    ID_PAGO: {
        type: DataTypes.INTEGER
    },
    ID_CLIENTE: {
        type: DataTypes.INTEGER
    },
    ID_DESCUENTO: {
        type: DataTypes.INTEGER
    },
    NUM_FACTURA: {
        type: DataTypes.STRING
    },
    DESCUENTO_REBAJAS: {
        type: DataTypes.DECIMAL
    },
    VENTA_EXENTA: {
        type: DataTypes.DECIMAL
    },
    VENTA_GRAVADA: {
        type: DataTypes.DECIMAL
    },
    EXONERADO: {
        type: DataTypes.DECIMAL
    },
    ISV: {
        type: DataTypes.DECIMAL
    },
    IMPUESTO_SOBRE_BEBIDAS_Y_ALCOHOL: {
        type: DataTypes.DECIMAL
    },
    TOTAL: {
        type: DataTypes.DECIMAL
    },
    RECIBIDO: {
        type: DataTypes.DECIMAL
    },
    CAMBIO: {
        type: DataTypes.DECIMAL
    },
}, {
    tableName: 'TBL_MF_FACTURA',
    timestamps: false,
})

//Para exportar el modelo
module.exports = Factura;
const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Facturacion = db.define(`TBL_MF_FACTURACION`, {
    ID_PEDID: {
        type: DataTypes.INTEGER
    },
    ID_PAG: {
        type: DataTypes.INTEGER
    },
    ID_CLIENT: {
        type: DataTypes.INTEGER
    },
    ID_DESCUENT: {
        type: DataTypes.INTEGER
    },
    ID_CAII: {
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
    ORDEN_COMPRA_EXENTA: {
        type: DataTypes.INTEGER
    },
    NUMERO_COMPRA_SAG: {
        type: DataTypes.STRING
    },
    CONSTANCIA_REGISTRO_EXONERADO: {
        type: DataTypes.STRING
    },
}, {
    tableName: 'TBL_MF_FACTURACION',
    timestamps: false,
})

//Para exportar el modelo
module.exports = Facturacion;
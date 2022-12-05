const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')

const ViewFacturacion = db.define(`VIEW_MF_FACTURACION`, {
    ID: {
        type: DataTypes.INTEGER
    },
    ID_PEDIDO: {
        type: DataTypes.INTEGER
    },
    ID_PAGO: {
        type: DataTypes.INTEGER
    },
    FORMA_PAGO: {
        type: DataTypes.STRING
    },
    ID_CLIENTE: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    ID_DESCUENTO: {
        type: DataTypes.INTEGER
    },
    NOMBRE_DESCUENTO: {
        type: DataTypes.STRING
    },
    ID_CAI: {
        type: DataTypes.INTEGER,        
    },
    CAI: {
        type: DataTypes.STRING
    },
    RANGO_MINIMO: {
        type: DataTypes.STRING
    },
    RANGO_MAXIMO: {
        type: DataTypes.STRING
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
    tableName: 'VIEW_MF_FACTURACION',
    timestamps: false,
})

//Para exportar el modelo
module.exports = ViewFacturacion;
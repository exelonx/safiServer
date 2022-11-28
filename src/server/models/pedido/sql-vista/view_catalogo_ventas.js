const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewCatalogoVenta = db.define(`VIEW_MP_CATALOGO_VENTA`, {

    ID: {
        type: DataTypes.INTEGER
    },
    ID_CATALOGO_VENTA: {
        type: DataTypes.INTEGER
    },
    ID_CATALOGO: {
        type: DataTypes.INTEGER
    },
    NOMBRE_CATALOGO: {
        type: DataTypes.STRING
    },
    ID_TIPO_PRODUCTO: {
        type: DataTypes.INTEGER
    },
    TIPO_PRODUCTO: {
        type: DataTypes.STRING
    },
    ID_IMPUESTO: {
        type: DataTypes.INTEGER
    },
    PORCENTAJE: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    PRECIO: {
        type: DataTypes.DECIMAL
    },
    EXENTA: {
        type: DataTypes.BOOLEAN
    },
    DESCRIPCION: {
        type: DataTypes.STRING
    },
    FECHA_INICIO: {
        type: DataTypes.DATE
    },
    FECHA_FINAL: {
        type: DataTypes.DATE
    },
    ESTADO: {
        type: DataTypes.BOOLEAN
    },
    SIN_ESTADO: {
        type: DataTypes.BOOLEAN
    },
    BEBIDA: {
        type: DataTypes.BOOLEAN
    }
}, {
    tableName: 'VIEW_MP_CATALOGO_VENTA',
    timestamps: false,
})


//Para exportar el modelo
module.exports = ViewCatalogoVenta;
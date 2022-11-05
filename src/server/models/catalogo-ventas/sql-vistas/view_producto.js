const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewProducto = db.define(`VIEW_MP_PRODUCTO`, {

    ID_IMPUESTO: {
        type: DataTypes.INTEGER
    },
    PORCENTAJE: {
        type: DataTypes.DECIMAL
    },
    ID_TIPO_PRODUCTO: {
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
    SIN_ESTADO: {
        type: DataTypes.BOOLEAN
    },
    BEBIDA: {
        type: DataTypes.BOOLEAN
    },
    IMAGEN: {
        type: DataTypes.BLOB
    },
    ID_CREADO_POR: {
        type: DataTypes.INTEGER
    },
    CREADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_CREACION: {
        type: DataTypes.DATE
    },
    ID_MODIFICADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICACION_POR: {
        type: DataTypes.STRING
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'VIEW_MP_PRODUCTO',
    timestamps: false,
})


//Para exportar el modelo
module.exports = ViewProducto;
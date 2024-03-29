const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewSoloProducto = db.define(`VIEW_MP_SOLO_PRODUCTO`, {

    ID: {
        type: DataTypes.INTEGER
    },
    ID_IMPUESTO: {
        type: DataTypes.INTEGER
    },
    PORCENTAJE: {
        type: DataTypes.DECIMAL
    },
    ID_TIPO_PRODUCTO: {
        type: DataTypes.INTEGER
    },
    TIPO_PRODUCTO: {
        type: DataTypes.STRING
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
    tableName: 'VIEW_MP_SOLO_PRODUCTO',
    timestamps: false,
})




//Para exportar el modelo
module.exports = ViewSoloProducto;
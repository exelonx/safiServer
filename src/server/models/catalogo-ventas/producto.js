const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Producto = db.define(`TBL_MP_PRODUCTO`, {

    ID_IMPUESTO: {
        type: DataTypes.INTEGER
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
    CREADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.INTEGER
    },
}, {
    tableName: 'TBL_MP_PRODUCTO',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})


//Para exportar el modelo
module.exports = Producto;
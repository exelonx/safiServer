const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')

const ViewProveedor = db.define(`VIEW_MI_PROVEEDOR`, {
    ID: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    ID_DIRECCION: {
        type: DataTypes.INTEGER
    },
    DETALLE: {
        type: DataTypes.STRING
    },
    ID_MUNICIPIO: {
        type: DataTypes.INTEGER
    },
    MUNICIPIO: {
        type: DataTypes.STRING
    },
    ID_DEPARTAMENTO: {
        type: DataTypes.INTEGER
    },
    DEPARTAMENTO: {
        type: DataTypes.STRING
    },
    TELEFONO: {
        type: DataTypes.STRING
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
    tableName: 'VIEW_MI_PROVEEDOR',
    timestamps: false,
})

//Para exportar el modelo
module.exports = ViewProveedor;
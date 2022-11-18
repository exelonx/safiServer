const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')

const ViewDireccion = db.define(`VIEW_DIRECCION`, {
    ID: {
        type: DataTypes.INTEGER
    },
    ID_MUNICIPIO: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    DETALLE: {
        type: DataTypes.STRING
    },
}, {
    tableName: 'VIEW_DIRECCION',
    timestamps: false,
})

//Para exportar el modelo
module.exports = ViewDireccion;
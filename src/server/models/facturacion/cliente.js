const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Cliente = db.define(`TBL_MF_CLIENTE`, {

    DIRECCION: {
        type: DataTypes.STRING
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    RTN_CLIENTE: {
        type: DataTypes.INTEGER
    },
    EXONERADO: {
        type: DataTypes.BOOLEAN
    },
    DNI: {
        type: DataTypes.INTEGER
    },
}, {
    tableName: 'TBL_MF_CLIENTE',
    timestamps: false,
})

//Para exportar el modelo
module.exports = Cliente;
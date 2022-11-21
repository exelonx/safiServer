const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Direccion = db.define(`TBL_DIRECCION`, {
    ID_MUNICIPIO: {
        type: DataTypes.INTEGER,        
    },
    DETALLE: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_DIRECCION',
    timestamps: false,
})

//Para exportar el modelo
module.exports = Direccion;
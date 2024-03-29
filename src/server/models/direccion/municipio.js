const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Municipio = db.define(`TBL_MUNICIPIO`, {
    ID: {
        type: DataTypes.INTEGER, 
        primaryKey: true        
    },
    ID_DEPARTAMENTO: {
        type: DataTypes.INTEGER,     
    },
    NOMBRE: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MUNICIPIO',
    timestamps: false,
})

//Para exportar el modelo
module.exports = Municipio;
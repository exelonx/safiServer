const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Departamento = db.define(`TBL_DEPARTAMENTO`, {
    ID: {
        type: DataTypes.INTEGER, 
        primaryKey: true        
    },
    NOMBRE: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_DEPARTAMENTO',
    timestamps: false,
})

//Para exportar el modelo
module.exports = Departamento;
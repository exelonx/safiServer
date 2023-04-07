const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Token = db.define(`TBL_MS_TOKEN`, {
    TOKEN: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, {
    tableName: 'TBL_MS_TOKEN',
    timestamps: false
})

//Para exportar el modelo
module.exports = Token;
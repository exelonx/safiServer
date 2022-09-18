const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewParametro = db.define(`VIEW_MS_PARAMETRO`, {
    ID_PARAMETRO: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    PARAMETRO: {
        type: DataTypes.STRING
    },
    VALOR: {
        type: DataTypes.STRING
    },
    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    USUARIO: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'VIEW_MS_PARAMETRO',
    timestamps: false,
})

module.exports = ViewParametro;
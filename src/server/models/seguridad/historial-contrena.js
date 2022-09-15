const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const HistorialContrasena = db.define(`TBL_MS_HIST_CONTRASENA`, {
    ID_HIST: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    ID_USUARIO: {
        type: DataTypes.INTEGER,
    },
    CONTRASENA: {
        type: DataTypes.STRING,
    }
}, {
    tableName: 'TBL_MS_HIST_CONTRASENA',
    timestamps: false,
})

module.exports = HistorialContrasena;
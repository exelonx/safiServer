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
    ID_CREADO_POR: {
        type: DataTypes.INTEGER
    },
    CREADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_CREACION:{
        type: DataTypes.DATE
    },
    ID_MODIFICADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'VIEW_MS_PARAMETRO',
    timestamps: false,
})

module.exports = ViewParametro;
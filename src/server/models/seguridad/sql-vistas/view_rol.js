const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewRol = db.define(`VIEW_MS_ROL`, {
    ID_ROL: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    ROL: {
        type: DataTypes.STRING
    },
    DESCRIPCION: {
        type: DataTypes.STRING
    },
    ID_CREADO_POR:{
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
    MODIFICADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    },
    ESTADO: {
        type: DataTypes.BOOLEAN
    }
}, {
    tableName: 'VIEW_MS_ROL',
    timestamps: false,
})

module.exports = ViewRol;
const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')

const ViewPermiso = db.define(`VIEW_MS_PERMISO`, {
    ID_PERMISO: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    ID_ROL: {
        type: DataTypes.INTEGER
    },
    ROL: {
        type: DataTypes.STRING
    },
    ID_OBJETO: {
        type: DataTypes.INTEGER
    },
    OBJETO: {
        type: DataTypes.STRING
    },
    PERMISO_INSERCION: {
        type: DataTypes.BOOLEAN
    },
    PERMISO_ELIMINACION: {
        type: DataTypes.BOOLEAN
    },
    PERMISO_ACTUALIZACION: {
        type: DataTypes.BOOLEAN
    },
    PERMISO_CONSULTAR: {
        type: DataTypes.BOOLEAN
    }
}, {
    tableName: 'VIEW_MS_PERMISO',
    timestamps: false,
})

module.exports = ViewPermiso;
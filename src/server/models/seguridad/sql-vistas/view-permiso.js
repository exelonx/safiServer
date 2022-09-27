const { DataTypes, DATE } = require('sequelize')

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
    }
}, {
    tableName: 'VIEW_MS_PERMISO',
    timestamps: false,
})

module.exports = ViewPermiso;
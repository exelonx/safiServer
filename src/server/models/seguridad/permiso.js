const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Permiso = db.define(`TBL_MS_PERMISO`, {
    ID_PERMISO:{
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    ID_ROL: {
        type: DataTypes.INTEGER
    },
    ID_OBJETO: {
        type: DataTypes.INTEGER
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
    CREADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'TBL_MS_PERMISO',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})

module.exports = Permiso;
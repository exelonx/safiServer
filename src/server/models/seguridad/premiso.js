const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Permiso = db.define(`TBL_MS_PERMISO`, {
    ID_ROL: {
        type: DataTypes.INTEGER,
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
    }
}, {
    tableName: 'TBL_MS_PERMISO',
    timestamps: false,
})

Permiso.removeAttribute('id');

module.exports = Permiso;
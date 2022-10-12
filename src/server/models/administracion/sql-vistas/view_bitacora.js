const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewBitacora = db.define(`VIEW_MS_BITACORA`, {
    FECHA: {
        type: DataTypes.DATE,
    },
    USUARIO: {
        type: DataTypes.STRING
    },
    OBJETO: {
        type: DataTypes.STRING
    },
    ACCION: {
        type: DataTypes.STRING
    },
    DESCRIPCION: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'VIEW_MS_BITACORA',
    timestamps: false,
})

//Solo cuando no tenga llave primaria
ViewBitacora.removeAttribute('id');

module.exports = ViewBitacora;
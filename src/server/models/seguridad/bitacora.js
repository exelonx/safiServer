const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const BitacoraSistema = db.define(`TBL_MS_BITACORA`, {
    ID_BITACORA: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    FECHA:{
        type: DataTypes.DATE
    },
    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    ID_OBJETO: {
        type: DataTypes.INTEGER
    },
    ACCION:{
        type: DataTypes.STRING
    },
    DESCRIPCION: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MS_BITACORA',
    timestamps: false,
})

module.exports = BitacoraSistema;
const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Roles = db.define(`TBL_MS_ROL`, {
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
    CREADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.INTEGER
    },
    ESTADO: {
        type: DataTypes.BOOLEAN
    }
}, {
    tableName: 'TBL_MS_ROL',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})

//Para exportar el modelo
module.exports = Roles;
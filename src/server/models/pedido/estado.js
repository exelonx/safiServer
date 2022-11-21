const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Estado = db.define(`TBL_MP_ESTADO`, {

    ESTADO: {
        type: DataTypes.STRING
    },
    COLOR: {
        type: DataTypes.STRING
    },
    CREADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_CREACION: {
        type: DataTypes.DATE
    },
    MODIFICADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'TBL_MP_ESTADO',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})


//Para exportar el modelo
module.exports = Estado;
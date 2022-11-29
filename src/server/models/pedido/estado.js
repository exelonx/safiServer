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
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'TBL_MP_ESTADO',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})


//Para exportar el modelo
module.exports = Estado;
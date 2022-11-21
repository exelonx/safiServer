const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewEstado= db.define(`VIEW_MP_ESTADO`, {

    ID: {
        type: DataTypes.INTEGER
    },
    ESTADO: {
        type: DataTypes.STRING
    },
    COLOR: {
        type: DataTypes.STRING
    },
    ID_CREADO_POR: {
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
    tableName: 'VIEW_MP_ESTADO',
    timestamps: false,
})


//Para exportar el modelo
module.exports = ViewEstado;
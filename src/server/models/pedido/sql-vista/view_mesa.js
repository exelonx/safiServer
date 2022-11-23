const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewMesa = db.define(`VIEW_MP_MESA`, {
    ID: {
        type: DataTypes.INTEGER
    },
    ID_ESTADO: {
        type: DataTypes.INTEGER
    },
    ESTADO: {
        type: DataTypes.STRING
    },
    COLOR: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    INFORMACION: {
        type: DataTypes.BOOLEAN
    },
    TIPO: {
        type: DataTypes.INTEGER
    },
    FECHA: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'VIEW_MP_MESA',
    timestamps: false,
})

module.exports = ViewMesa;
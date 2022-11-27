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
        type: DataTypes.STRING
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    INFORMACION: {
        type: DataTypes.STRING
    },
    TIPO: {
        type: DataTypes.INTEGER
    },
    FECHA: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'VIEW_MP_MESA',
    timestamps: false,
})

module.exports = ViewMesa;
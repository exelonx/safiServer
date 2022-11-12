const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewKardex = db.define(`VIEW_MI_KARDEX`, {
    ID: {
        type: DataTypes.NUMBER
    },
    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    USUARIO: {
        type: DataTypes.STRING
    },
    ID_INSUMO: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    CANTIDAD: {
        type: DataTypes.DECIMAL
    },
    TIPO_MOVIMIENTO: {
        type: DataTypes.STRING
    },
    FECHA_Y_HORA: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'VIEW_MI_KARDEX',
    timestamps: false,
})

module.exports = ViewKardex;
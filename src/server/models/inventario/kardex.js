const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Kardex = db.define(`TBL_MI_KARDEX`, {
    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    ID_INSUMO: {
        type: DataTypes.INTEGER
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
    tableName: 'TBL_MI_KARDEX',
    timestamps: false,
})

module.exports = Kardex;
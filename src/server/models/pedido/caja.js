const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Caja = db.define(`TBL_MA_CAJA`, {

    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    SALDO_APERTURA: {
        type: DataTypes.DECIMAL
    },
    SALDO_ACTUAL: {
        type: DataTypes.DECIMAL
    },
    ESTADO: {
        type: DataTypes.BOOLEAN
    },
    SALDO_CIERRE: {
        type: DataTypes.DECIMAL
    },
    FECHA_APERTURA : {
        type: DataTypes.DATE
    },
    FECHA_CIERRE : {
        type: DataTypes.DATE
    }
}, {
    tableName: 'TBL_MA_CAJA',
    timestamps: false
})


//Para exportar el modelo
module.exports = Caja;
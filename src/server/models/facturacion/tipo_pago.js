const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const TipoPago = db.define(`TBL_MF_TIPO_PAGO`, {

    FORMA_PAGO: {
        type: DataTypes.STRING
    },
}, {
    tableName: 'TBL_MF_TIPO_PAGO',
    timestamps: false,
})

//Para exportar el modelo
module.exports = TipoPago;
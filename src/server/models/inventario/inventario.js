const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Inventario = db.define(`TBL_MI_INVENTARIO`, {
    ID: {
        type: DataTypes.INTEGER, 
        primaryKey: true
    },
    ID_INSUMO: {
        type: DataTypes.INTEGER
    },
    EXISTENCIA: {
        type: DataTypes.DECIMAL
    }
}, {
    tableName: 'TBL_MI_INVENTARIO',
    timestamps: false
})

//Para exportar el modelo
module.exports = Inventario;
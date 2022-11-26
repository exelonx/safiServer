const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Compra = db.define(`TBL_MI_COMPRA`, {
    
    ID_PROVEEDOR: {
        type: DataTypes.INTEGER
    },
    TOTAL_PAGADO: {
        type: DataTypes.DECIMAL
    },
    FECHA: {
        type: DataTypes.DATE
    },
    ESTADO: {
        type: DataTypes.BOOLEAN
    },
    CREADO_POR: {
        type: DataTypes.INTEGER
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    },
    MODIFICADO_POR: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'TBL_MI_COMPRA',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})

//Para exportar el modelo
module.exports = Compra;
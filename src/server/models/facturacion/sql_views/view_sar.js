const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')

const ViewSar = db.define(`VIEW_MF_SAR_ACTIVO`, {
    ID: {
        type: DataTypes.INTEGER, 
        primaryKey: true        
    },
    CAI: {
        type: DataTypes.STRING
    },
    RANGO_MINIMO: {
        type: DataTypes.STRING
    },
    RANGO_MAXIMO: {
        type: DataTypes.STRING
    }
    ,
    FECHA_AUTORIZADO: {
        type: DataTypes.DATE
    }
    ,
    FECHA_LIMITE_EMISION: {
        type: DataTypes.DATE
    }
    ,
    NUMERO_ACTUAL: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'VIEW_MF_SAR_ACTIVO',
    timestamps: false,
})

//Para exportar el modelo
module.exports = ViewSar;
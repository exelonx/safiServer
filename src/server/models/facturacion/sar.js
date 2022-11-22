const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Sar = db.define(`TBL_MF_SAR`, {
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
        type: DataTypes.STRING
    }
    ,
    FECHA_LIMITE_EMISION: {
        type: DataTypes.STRING
    }
    ,
    NUMERO_ACTUAL: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MF_SAR',
    timestamps: false,
})

//Para exportar el modelo
module.exports = Sar;
const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Parametro = db.define(`TBL_MS_PARAMETRO`, {
    ID_PARAMETRO: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    PARAMETRO: {
        type: DataTypes.STRING
    },
    VALOR: {
        type: DataTypes.STRING
    },
    ID_USUARIO: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'TBL_MS_PARAMETRO',
    timestamps: false,
})

//Para exportar el modelo
module.exports = Parametro;
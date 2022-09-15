const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Objeto = db.define(`TBL_MS_OBJETO`, {
    ID_OBJETO: {
        type: DataTypes.INTEGER,
        primaryKey: true,
    },
    OBJETO: {
        type: DataTypes.STRING,
    },
    DESCRIPCION: {
        type: DataTypes.STRING,
    },
    TIPO_OBJETO: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MS_OBJETO',
    timestamps: false,
})

module.exports = Objeto;
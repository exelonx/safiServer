const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Unidad = db.define(`TBL_MI_UNIDAD`, {
    ID: {
        type: DataTypes.INTEGER
    },
    UNIDAD_MEDIDA: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MI_UNIDAD',
    timestamps: false,
})

//Para exportar el modelo
module.exports = Unidad;
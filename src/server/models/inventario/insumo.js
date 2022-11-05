const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Insumo = db.define(`TBL_MI_INSUMO`, {
    ID: {
        type: DataTypes.INTEGER
    },
    ID_UNIDAD: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    CANTIDAD_MAXIMA: {
        type: DataTypes.INTEGER
    },
    CANTIDAD_MINIMA: {
        type: DataTypes.INTEGER
    },
    CREADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'TBL_MI_INSUMO',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})

//Para exportar el modelo
module.exports = Insumo;
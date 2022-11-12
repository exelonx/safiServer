const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')

const ViewInsumo = db.define(`VIEW_MI_INSUMO`, {
    ID: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    ID_UNIDAD: {
        type: DataTypes.INTEGER
    },
    UNIDAD_MEDIDA: {
        type: DataTypes.STRING
    },
    CANTIDAD_MAXIMA: {
        type: DataTypes.INTEGER
    },
    CANTIDAD_MINIMA: {
        type: DataTypes.INTEGER
    },
    ID_CREADO_POR: {
        type: DataTypes.INTEGER
    },
    CREADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_CREACION: {
        type: DataTypes.DATE
    },
    ID_MODIFICADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICACION_POR: {
        type: DataTypes.STRING
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'VIEW_MI_INSUMO',
    timestamps: false,
})

//Para exportar el modelo
module.exports = ViewInsumo;
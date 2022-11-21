const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewImpuesto = db.define(`VIEW_MP_TIPO_IMPUESTO`, {

    ID: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    PORCENTAJE: {
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
    MODIFICADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'VIEW_MP_TIPO_IMPUESTO',
    timestamps: false,
})


//Para exportar el modelo
module.exports = ViewImpuesto;
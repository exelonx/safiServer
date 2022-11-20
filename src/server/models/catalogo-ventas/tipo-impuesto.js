const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Impuesto = db.define(`TBL_MP_TIPO_IMPUESTO`, {

    NOMBRE: {
        type: DataTypes.STRING
    },
    PORCENTAJE: {
        type: DataTypes.DECIMAL
    },
    CREADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_CREACION: {
        type: DataTypes.DATE
    },
    MODIFICADO_POR: {
        type: DataTypes.STRING
    },
    FECHA_MODIFICACION: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'TBL_MP_TIPO_IMPUESTO',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})


//Para exportar el modelo
module.exports = Impuesto;
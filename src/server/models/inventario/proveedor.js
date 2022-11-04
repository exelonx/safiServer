const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')

const Proveedor = db.define(`TBL_MI_PROVEEDOR`, {
    ID: {
        type: DataTypes.INTEGER
    },
    ID_DIRECCION: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    TELEFONO: {
        type: DataTypes.STRING
    },
    CREADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'TBL_MI_PROVEEDOR',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})

//Para exportar el modelo
module.exports = Proveedor;
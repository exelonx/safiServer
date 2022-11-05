const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')

const ViewCatalogo = db.define(`VIEW_MP_CATALOGO`, {
   
    ID: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
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
    tableName: 'VIEW_MP_CATALOGO',
    timestamps: false,
})

//Para exportar el modelo
module.exports = ViewCatalogo;
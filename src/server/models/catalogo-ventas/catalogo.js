const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Catalogo = db.define(`TBL_MP_CATALOGO`, {

    NOMBRE_CATALOGO: {
        type: DataTypes.STRING
    },
    CREADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.INTEGER
    },
}, {
    tableName: 'TBL_MP_CATALOGO',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})




//Para exportar el modelo
module.exports = Catalogo;
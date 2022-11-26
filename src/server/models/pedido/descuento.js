const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Descuento = db.define(`TBL_MF_DESCUENTO`, {

    NOMBRE: {
        type: DataTypes.STRING
    },
    CANTIDAD: {
        type: DataTypes.INTEGER
    },
    ID_TIPO_DESCUENTO: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MF_DESCUENTO',
    timestamps: false,
    
})


//Para exportar el modelo
module.exports = Descuento;
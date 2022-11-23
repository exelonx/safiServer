const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Mesa = db.define(`TBL_MP_MESA`, {

    ID_ESTADO: {
        type: DataTypes.INTEGER
    },
    NOMBRE: {
        type: DataTypes.STRING
    },
    INFORMACION: {
        type: DataTypes.STRING
    },
    TIPO: {
        type: DataTypes.STRING
    },
    FECHA: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'TBL_MP_MESA',
    timestamps: false
})


//Para exportar el modelo
module.exports = Mesa;
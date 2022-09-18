const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const PreguntaUsuario = db.define(`TBL_MS_PREGUNTA_USUARIO`, {
    ID: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    ID_PREGUNTA: {
        type: DataTypes.INTEGER
    },
    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    RESPUESTA: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MS_PREGUNTA_USUARIO',
    timestamps: false,
})

module.exports = PreguntaUsuario;
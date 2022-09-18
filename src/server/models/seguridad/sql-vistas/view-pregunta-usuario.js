const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewPreguntaUsuario = db.define(`VIEW_MS_PREGUNTA_USUARIO`, {
    ID_PREGUNTA: {
        type: DataTypes.INTEGER,
    },
    PREGUNTA: {
        type: DataTypes.STRING
    },
    ID_USUARIO: {
        type: DataTypes.INTEGER
    },
    USUARIO: {
        type: DataTypes.STRING
    },
    RESPUESTA: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'VIEW_MS_PREGUNTA_USUARIO',
    timestamps: false,
})

ViewPreguntaUsuario.removeAttribute('id');

module.exports = ViewPreguntaUsuario;
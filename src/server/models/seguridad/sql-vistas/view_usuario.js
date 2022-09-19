const { DataTypes } = require('sequelize')

const { db } = require('../../../database/db-conexion')


const ViewUsuarios = db.define(`VIEW_MS_USUARIO`, {
    ID_USUARIO: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    USUARIO: {
        type: DataTypes.STRING
    },
    NOMBRE_USUARIO: {
        type: DataTypes.STRING
    },
    ESTADO_USUARIO: {
        type: DataTypes.STRING,
        default: true
    },
    CONTRASENA: {
        type: DataTypes.STRING
    },
    ID_ROL: {
        type: DataTypes.INTEGER
    },
    ROL: {
        type: DataTypes.STRING
    },
    FECHA_ULTIMA_CONEXION: {
        type: DataTypes.DATE
    },
    PREGUNTAS_CONTESTADAS: {
        type: DataTypes.INTEGER
    },
    PRIMER_INGRESO: {
        type: DataTypes.INTEGER
    },
    FECHA_VENCIMIENTO: {
        type: DataTypes.DATE
    },
    CORREO_ELECTRONICO: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'VIEW_MS_USUARIO',
    timestamps: false,
})

//Para exportar el modelo
module.exports = ViewUsuarios;
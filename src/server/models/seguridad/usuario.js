const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Usuarios = db.define(`TBL_MS_USUARIO`, {
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
    },
    INTENTOS: {
        type: DataTypes.INTEGER
    },
    AUTOREGISTRADO: {
        type: DataTypes.BOOLEAN
    },
    CREADO_POR: {
        type: DataTypes.INTEGER
    },
    MODIFICADO_POR: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'TBL_MS_USUARIO',
    timestamps: true,
    createdAt: 'FECHA_CREACION',
    updatedAt: 'FECHA_MODIFICACION'
})

//Para exportar el modelo
module.exports = Usuarios;
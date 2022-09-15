const { DataTypes } = require('sequelize')

const { db } = require('../../database/db-conexion')


const Roles = db.define(`TBL_MS_ROL`, {
    ID_ROL: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    ROL: {
        type: DataTypes.STRING
    },
    DESCRIPCION: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'TBL_MS_ROL',
    timestamps: false,
})

//Solo cuando no tenga llave primaria
Roles.removeAttribute('id');

//Para exportar el modelo
module.exports = Roles;
const {DataTypes} = require('sequelize');

const { db } = require('../../database/db-conexion');


const Preguntas = db.define('TBL_MS_PREGUNTA', {
    ID_PREGUNTA: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    PREGUNTA: {
        type: DataTypes.STRING
    }
    
}, {
    tableName: 'TBL_MS_PREGUNTA',
    timestamps: false,
});

module.exports = Preguntas;
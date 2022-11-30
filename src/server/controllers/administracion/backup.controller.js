const { request, response } = require('express');
const { Op } = require('sequelize');
const mysql = require('mysql2')

const { eventBitacora } = require('../../helpers/event-bitacora');
const { generarBackup } = require('../../jobs/db-backup');

const getBackup = async (req = request, res = response) => {

    const {servidor ="", usuario = "", contrasena = "", base = "" } = req.body;
    
    try {

        const connection = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.ESQUEMA
        });

        const host = process.env.MYSQL_HOST;
        const user = process.env.SQL_USER;
        const password = process.env.SQL_PASSWORD;
        const database = process.env.ESQUEMA;
        
        connection.query(`SELECT CONVERT(SUM(data_length + index_length)/1048576, DECIMAL(6,2)) "SIZE(MB)" FROM
        information_schema.tables WHERE table_schema = "${process.env.ESQUEMA}"`,
        function(err, result, fields){
            res.json({
                ok: true,
                result,
                host,
                user,
                password,
                database
            })
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
    
}

const validarConexion = async (req = request, res = response) => {

    const {servidor ="", usuario = "", contrasena = "", base = "" } = req.body;
    
    try {

        if(servidor != process.env.MYSQL_HOST || usuario != process.env.SQL_USER || contrasena != process.env.SQL_PASSWORD || base !=process.env.ESQUEMA){
            return res.status(404).json({
                ok: false,
                msg: "¡Conexión Fállida!"
            })
        }else{
            return res.status(200).json({
                ok: true,
                msg: "¡Conexión Exitosa!"
            })
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
    
}

const postBackup = async (req = request, res = response) => {
    
    let {nombreBackup=''} = req.body

    try {

        // Crear backup de la base de datos
        const backup = await generarBackup(nombreBackup);

        res.status(200).json({
            ok: true,
            msg: 'Copia de seguridad creada.'
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
    
        
        
}

module.exports = {
    getBackup,
    validarConexion,
    postBackup
}
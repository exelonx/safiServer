const { request, response } = require('express');
const path = require('path');
const fs = require("fs");
const mysqldump = require('mysqldump');
const { patch } = require('../routes/seguridad/auth.routes');
const exec = require('child_process').exec;

const generarBackup = async() => {

    const nombreBackup = 'db-backup-automatico.sql'
    
        await mysqldump({
            connection: {
                host: process.env.MYSQL_HOST,
                user: process.env.SQL_USER,
                password: process.env.SQL_PASSWORD,
                database: process.env.ESQUEMA,
            }, dumpToFile: path.join(__dirname, '../../server/backups', nombreBackup)
        });
}

const generarBackupParaApi = async(nombre, direccion) => {

    try {
    
        const nombreBackup = nombre + '.sql'
        
            await mysqldump({
                connection: {
                    host: process.env.MYSQL_HOST,
                    user: process.env.SQL_USER,
                    password: process.env.SQL_PASSWORD,
                    database: process.env.ESQUEMA,
                }, dumpToFile: path.join(__dirname, '../../server/backups/',direccion , nombreBackup)
            });
    } catch (error) {
        console.log(error)
    }
    
}

module.exports = {
    generarBackup,
    generarBackupParaApi
}


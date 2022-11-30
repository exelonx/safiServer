const { request, response } = require('express');
const path = require('path');
const mysqldump = require('mysqldump');
const { patch } = require('../routes/seguridad/auth.routes');


const generarBackup = async(backup) => {

    const nombreBackup = backup + '.sql'
    
        await mysqldump({
            connection: {
                host: process.env.MYSQL_HOST,
                user: process.env.SQL_USER,
                password: process.env.SQL_PASSWORD,
                database: process.env.ESQUEMA,
            }, dumpToFile: path.join(__dirname, '../../server/backups', nombreBackup)
        });
}

module.exports = {
    generarBackup
}


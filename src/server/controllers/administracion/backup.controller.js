const { request, response } = require('express');

const { Op } = require('sequelize');
const mysql = require('mysql2')
const { exec } = require('child_process');

const { eventBitacora } = require('../../helpers/event-bitacora');
const { generarBackup, generarBackupParaApi } = require('../../jobs/db-backup');
const { emit } = require('../../helpers/notificar');
const path = require('path');

const getBackup = async (req = request, res = response) => {
    
    try {
        const host = process.env.MYSQL_HOST;
        const user = process.env.SQL_USER;
        const password = process.env.SQL_PASSWORD;
        const database = process.env.ESQUEMA;

            res.json({
                ok: true,
                host,
                user,
                password,
                database
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

    const {servidor ="", usuario = "", contrasena = "", base = "" } = req.query;
    
    try {

        if(servidor != process.env.MYSQL_HOST || usuario != process.env.SQL_USER || contrasena != process.env.SQL_PASSWORD || base !=process.env.ESQUEMA){
            return res.status(404).json({
                ok: false,
                msg: "¡Conexión Fállida!"
            })
        }else{

            const connection = mysql.createConnection({
                host: process.env.MYSQL_HOST,
                user: process.env.SQL_USER,
                password: process.env.SQL_PASSWORD,
                database: process.env.ESQUEMA
            });
            
            connection.query(`SELECT CONVERT(SUM(data_length + index_length)/1048576, DECIMAL(6,2)) Tamano FROM
            information_schema.tables WHERE table_schema = "${process.env.ESQUEMA}"`,
            function(err, tamano, fields){
                const result = tamano[0].Tamano
                res.json({
                    ok: true,
                    result,
                    msg: "¡Conexión Exitosa!"
                })
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
    
    let {nombreBackup='', ubicacion = "", id_usuario = ""} = req.body

    try {
        console.log((ubicacion.length-1) !== "/")

        if(ubicacion.includes('//')) {
            return res.status(400).json({
                ok: false,
                msg: 'Ubicación no válida'
            })
        }

        if(ubicacion.substring(ubicacion.length-1) !== "/" && ubicacion != "") {
            return res.status(400).json({
                ok: false,
                msg: 'Falta un "/" en la ubicación'
            })
        }

        emit('backup', {id_usuario});
        eventBitacora(new Date, id_usuario, 20, 'RESPALDO', `SE REALIZÓ UNA COPIA DE LA BASE DE DATOS`)
        // Crear backup de la base de datos
        // const backup = await generarBackupParaApi(nombreBackup, ubicacion);
        // var child = exec( `mysqldump -u ${process.env.SQL_USER} -p ${process.env.SQL_PASSWORD} ${process.env.ESQUEMA} > src/server/backups/${nombreBackup}.sql`);
        const cmd = `"${process.env.PATH_W}mysqldump" -u ${process.env.SQL_USER} -p${process.env.SQL_PASSWORD} ${process.env.ESQUEMA} > src/server/backups/${nombreBackup}.sql`
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
              console.log(`Error al exportar la base de datos: ${error.message}`);
              return;
            }
            if (stderr) {
                res.download(
                  __dirname +
                    "../../../../server/backups/" +
                    ubicacion +
                    nombreBackup +
                    ".sql",
                  (err) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("success");
                    }
                  }
                );
                
                return;
            }
            console.log('Backup creado correctamente');
            
          });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }       
        
}

const putBackup = async(req, res = response) =>{

    const {backup} = req.files;
    const {id_usuario} = req.body;

    console.log(backup)
    const uploadPath = path.join( __dirname, "../../../../src/server/backups/", backup.name);

    await backup.mv(uploadPath, (err) => {
        if( err ){
            return res.status(500).json({err})
        }
    })

    const cmd = `"${process.env.PATH_W}mysql" -u ${process.env.SQL_USER} -p${process.env.SQL_PASSWORD} ${process.env.ESQUEMA} < src/server/backups/${backup.name}`
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al restaurar la base de datos: ${error}`);
          return;
        }
        eventBitacora(new Date, id_usuario, 20, 'RESTAURACIÓN', `SE REALIZÓ UNA RESTAURACIÓN DE LA BASE DE DATOS`)
        return res.json({msg: `Base de datos restaurada correctamente`})
      });


}

module.exports = {
    getBackup,
    validarConexion,
    postBackup,
    putBackup
}
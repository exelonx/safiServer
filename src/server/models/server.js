const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload')
const cron = require('node-cron');
require('dotenv').config();
const colors = require('colors/safe');

// Importación de la conexión y parametros de la DB
const { db } = require('../database/db-conexion');
const Parametro = require('../models/seguridad/parametro');

// Routers de las APIs
const routerAuth = require('../routes/seguridad/auth.routes');
const routerUsuario = require('../routes/seguridad/usuario.routes');
const routerRol = require('../routes/seguridad/roles.routes');
const routerPregunta = require('../routes/seguridad/pregunta.routes');
const routerPregUser = require('../routes/seguridad/pregunta-usuario.routes');
const routerParametro = require('../routes/seguridad/parametro.routes');
const routerPermiso = require('../routes/seguridad/permiso.routes');
const routerBackup = require('../routes/administracion/backup.routes');
const { depurarBitacora } = require('../helpers/depuradorBitacora');

class Server {
    constructor () {

        // Configuración de express y WebSocket
        this.app    = express();
        this.http   = require('http').Server(this.app);
        this.io     = require('socket.io')(this.http, {
            // Cors para los sockets
            cors: {
                origin: '*'
            }
        });

        // rutas
        this.apiPath = {
            // SEGURIDAD
            auth:             '/api/auth',
            usuario:          '/api/usuario',
            rol:              '/api/rol',
            pregunta:         '/api/pregunta',
            preguntaUsuarios: '/api/pregunta-usuario',
            parametro:        '/api/parametro',
            permiso:          '/api/permiso',
            // ADMINISTRACION
            dbBackup:         '/api/db-backup'
        }

        // middlewares
        this.conexionDB();
        this.middlewares();
        this.routes();
        this.websocket();

        // Tareas programadas
        this.tareaDepurarBitacora();
    }

    // ---------------Métodos---------------

    async conexionDB () {
        try {
            await db.authenticate();
            const sistemaNombre = await Parametro.findOne({where: { PARAMETRO: 'SYS_NOMBRE' } });
            console.log(colors.underline.cyan('\n'+sistemaNombre.VALOR))
            console.log(colors.bold.green('Base de datos online'));
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    middlewares () {
        // Cors para express
        this.app.use(cors());

        // Lectura del body
        this.app.use(express.json());

        // Carga de archivos
        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/'
        }));
    }

    routes () {
        // Seguridad
        this.app.use(this.apiPath.auth, routerAuth);                   // Autenticación (Login)
        this.app.use(this.apiPath.usuario, routerUsuario);             // Usuarios
        this.app.use(this.apiPath.rol, routerRol);                     // Roles
        this.app.use(this.apiPath.pregunta, routerPregunta);           // Pregunta
        this.app.use(this.apiPath.preguntaUsuarios, routerPregUser);   // Preguntas de los usuarios (Respuestas)
        this.app.use(this.apiPath.parametro, routerParametro);         // Parametros del sistema
        this.app.use(this.apiPath.permiso, routerPermiso);             // Permisos
        // Administracion
        this.app.use(this.apiPath.dbBackup, routerBackup)
    }

    async listen () {
        // Levantar servidor
        this.http.listen(process.env.PORT, () => {
            console.log(`\nCorriendo en el puerto: ${colors.bold.red(process.env.PORT)}`)
        })
    }

    
    websocket() {
        this.io.on('connection', (cliente) => {
            console.log('Cliente conectado')
            
            //eliminar
            // socket.eliminar(cliente);
        })
    }

    //Métodos de Tareas Programadas
    tareaDepurarBitacora() {

        // Cada día, revisar registros de bitacora
        cron.schedule('0 0 * * *', async () => {
            await depurarBitacora();
        });

    }


}

module.exports = Server;
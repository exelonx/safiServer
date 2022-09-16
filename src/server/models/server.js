const express = require('express');
const cors = require('cors');
require('dotenv').config();
const colors = require('colors/safe');

// Importación de la conexión y parametros de la DB
const { db } = require('../database/db-conexion');
const Parametro = require('../models/seguridad/parametro');
const { clear } = require('console');

// Routers de las APIs
// const routerAuth = require('../routes/seguridad/auth.routes');

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
            auth:            '/api/auth',
            usuario:         '/api/usuario',
            rol:             '/api/rol',
            preguntaUsuario: '/api/pregunta-usuario'
        }
        
        this.conexionDB();
        this.middlewares();
        // this.routes();
        this.websocket();
    }

    async conexionDB () {
        try {
            await db.authenticate();
            const sistemaNombre = await Parametro.findOne({where: { PARAMETRO: 'SYS_NOMBRE' } });
            console.log(colors.underline.cyan(sistemaNombre.VALOR))
            console.log(colors.bold.green('Base de datos online'));
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    async llamarParametros () {
        return await Parametro.findAll();
    }

    middlewares () {
        //Cors para express
        this.app.use(cors());

        //Lectura del body
        this.app.use(express.json());
    }

    routes () {
        // Seguridad
        this.app.use(this.apiPath.auth, routerAuth)         //Autenticación (Login)
        // this.app.use(this.apiPath.usuario, routerUsuario)   //Usuarios
    }

    async listen () {
        // Extraer el parametro del puerto
        const puerto = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_CPUERTO' } });
        // Levantar servidor
        this.http.listen(puerto.VALOR, () => {
            console.log(`\nCorriendo en el puerto: ${colors.bold.red(puerto.VALOR)}`)
        })
    }

    websocket() {
        this.io.on('connection', (cliente) => {
            console.log('Cliente conectado')

            //eliminar
            socket.eliminar(cliente);
        })
    }
}

module.exports = Server;
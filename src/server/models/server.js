const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { db } = require('../database/db-conexion');

class Server {
    constructor () {
        //Configuración de express y WebSocket
        this.app    = express();
        this.http   = require('http').Server(this.app);
        this.io     = require('socket.io')(this.http, {
            cors: {
                origin: '*'
            }
        });

        //Puertos y rutas
        this.port    = process.env.PORT;
        this.apiPath = {
            auth:            '/api/auth',
            usuario:         '/api/usuario',
            rol:             '/api/rol',
            preguntaUsuario: '/api/pregunta-usuario'
        }

        this.dbConnetion();
        this.middlewares();
        // this.routes();
        this.websocket();
    }

    async dbConnetion () {
        try {
            await db.authenticate();
            console.log('Base de datos en linea');
        } catch (error) {
            console.log(error)
            throw new Error(error);
        }
    }

    middlewares () {
        //Cors
        this.app.use(cors());

        //Lectura del body
        this.app.use(express.json());
    }

    routes () {
        //Seguridad
        this.app.use(this.apiPath.usuario, routerUsuario)          //Usuarios
        this.app.use(this.apiPath.rol, routerRol)                  //Roles
    }

    listen () {
        this.http.listen(this.port, () => {
            console.log(`Corriendo en el puerto: ${this.port}`)
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
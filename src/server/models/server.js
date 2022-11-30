const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();
const colors = require('colors/safe');
const path = require('path');

// Sockets
const socket = require('../sockets/socket');

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
const routerBitacora = require('../routes/administracion/bitacora.routes');
const routerReporteria = require('../routes/reporteria/reporteria.routes');
const routerProveedores = require('../routes/inventario/proveedores.routes');
const routerUnidades = require('../routes/inventario/unidades.routes');
const routerNotificacion = require('../routes/notificaciones/notificaciones.routes');
const routerCatalogo = require('../routes/catalogo_ventas/catalogo.routes');
const routerInsumos = require('../routes/inventario/insumo.routes');
const routerProducto = require('../routes/catalogo_ventas/producto.routes');
const routerPantalla = require('../routes/seguridad/objeto.routes');
const routerKardex = require('../routes/inventario/kardex.routes');
const routerCompra = require('../routes/inventario/compra.routes');
const routerDireccion = require('../routes/direccion/direccion.routes');
const routerImpuesto = require('../routes/catalogo_ventas/tipo-impuesto.routes');
const routerEstado = require('../routes/pedido/estado.routes');
const routerSAR = require('../routes/facturacion/sar.routes')
const routerMesa = require('../routes/pedido/mesa.routes');
const routerPedido = require('../routes/pedido/pedido.routes');
const routerTipoProducto = require('../routes/catalogo_ventas/tipoProducto.routes');
const routerInventarios = require('../routes/inventario/inventario.routes');
const routerCaja = require('../routes/administracion/caja.routes')
const routerDescuento = require('../routes/pedido/descuento.routes');
const routerComboProducto = require('../routes/pedido/combo-producto.routes');
const routerPromocionProducto = require('../routes/pedido/promocion-producto.routes');
const routerInsumoProducto = require('../routes/inventario/insumo-producto.routes');
const routerCocina = require('../routes/pedido/cocina.routes');
const routerTipoPago = require('../routes/facturacion/tipo_pago.routes')


// Jobs
const { generarBackup } = require('../jobs/db-backup');
const { depurarBitacora } = require('../jobs/depuradorBitacora');

class Server {
    static instance
    constructor () {

        if (!Server.instance) {
            Server.instance = this
        }

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
            pantalla:         '/api/pantalla',

            // ADMINISTRACION
            bitacora:         '/api/bitacora',
            dbBackup:         '/api/db-backup',
            caja:             '/api/caja',

            // REPORTERÍA
            reporteria:       '/api/reporteria',

            // INVENTARIO
            proveedores:      '/api/proveedor',
            unidades:         '/api/unidad',
            insumos:          '/api/insumo',
            inventario:       '/api/inventario',
            kardex:           '/api/kardex',
            compra:           '/api/compra',
            compraDetalle:    '/api/compra-detalle',
            insumoProducto:   '/api/insumo-producto',

            // NOTIFICACION
            notificacion:     '/api/notificacion',

            // CATALOGO VENTA
            catalogos:        '/api/catalogo-venta',
            productos:        '/api/producto',
            impuestos:        '/api/impuesto',
            tipoProducto:     '/api/tipo-producto',

            //DIRECCION
            direccion:        '/api/direccion',

            //PEDIDOS
            estados:          '/api/estado',
            mesa:             '/api/mesa',
            pedido:           '/api/pedido',
            descuento:        '/api/descuento',

            comboProducto:    '/api/combo-producto',
            promocionProducto:'/api/promocion-producto',

            cocina:           '/api/cocina',


            //FACTURACION
            sar:              '/api/SAR',
            tipoPago:         '/api/tipo-pago',
        }

        // middlewares
        this.conexionDB();
        this.middlewares();
        this.routes();
        this.websocket();

        // Tareas programadas
        this.tareaDepurarBitacora();
        this.tareaGenerarBackup();


    }

    static getInstance() {
        return this.instance
    }

    // ---------------Métodos---------------

    async conexionDB () {
        try {
            await db.authenticate();
            const sistemaNombre = await Parametro.findOne({where: { PARAMETRO: 'SYS_NOMBRE' } });
            console.log(colors.underline.cyan('\n'+sistemaNombre.VALOR))
            console.log(colors.bold.green('Base de datos online 🍔🍗'));
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

        console.log()
        // Imagenes
        this.app.use('/imgs', express.static(path.join(process.cwd()+'/src/server/public/imgs')))
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
        this.app.use(this.apiPath.pantalla, routerPantalla)            // Pantallas/Objetos
        // Administracion
        this.app.use(this.apiPath.bitacora, routerBitacora)
        this.app.use(this.apiPath.dbBackup, routerBackup)              // Backups
        this.app.use(this.apiPath.caja, routerCaja)
        // Reportería
        this.app.use(this.apiPath.reporteria, routerReporteria)
        // Inventario
        this.app.use(this.apiPath.proveedores, routerProveedores)      // Proveedores
        this.app.use(this.apiPath.unidades, routerUnidades)            // Unidades
        this.app.use(this.apiPath.insumos, routerInsumos)              // Insumos
        this.app.use(this.apiPath.inventario, routerInventarios)          // Insumos
        this.app.use(this.apiPath.kardex, routerKardex)                // Kardex
        this.app.use(this.apiPath.compra, routerCompra)                // Compra
        this.app.use(this.apiPath.insumoProducto, routerInsumoProducto)  // Promocion Producto              
        // Notificacion
        this.app.use(this.apiPath.notificacion, routerNotificacion)
        // Catalogo de ventas
        this.app.use(this.apiPath.catalogos, routerCatalogo)
        this.app.use(this.apiPath.productos, routerProducto)
        this.app.use(this.apiPath.impuestos, routerImpuesto)
        this.app.use(this.apiPath.tipoProducto, routerTipoProducto)
        // Direccion
        this.app.use(this.apiPath.direccion, routerDireccion)          // Direccion
        // Pedidos
        this.app.use(this.apiPath.estados, routerEstado)               // Estados del pedido
        this.app.use(this.apiPath.mesa, routerMesa)                    // Mesas
        this.app.use(this.apiPath.pedido, routerPedido)                // Pedido
        this.app.use(this.apiPath.descuento, routerDescuento)          // Descuento

        this.app.use(this.apiPath.comboProducto, routerComboProducto)  // Combo Producto
        this.app.use(this.apiPath.promocionProducto, routerPromocionProducto)  // Promocion Producto

        this.app.use(this.apiPath.cocina, routerCocina)                // Cocina

        // Facturacion
        this.app.use(this.apiPath.sar, routerSAR)                      // SAR
        this.app.use(this.apiPath.tipoPago, routerTipoPago)            // Tipo de pago
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

            // Desconectar
            socket.desconectar( cliente );
            socket.mensaje(cliente, this.io)
        })

    }

    //Métodos de Tareas Programadas
    tareaDepurarBitacora() {

        // Cada día 12 AM, revisar registros de bitacora
        cron.schedule('0 0 * * *', async () => {
            await depurarBitacora();
        });

    }

    tareaGenerarBackup() {

        // Cada día 12 AM, crear backup de la base de datos
        cron.schedule('0 0 * * *', async () => {
            await generarBackup()
                .catch(err => console.log(err));
        });

    }


}

module.exports = Server;
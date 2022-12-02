const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewSar = require('../../models/facturacion/sql_views/view_sar');
const ViewPedido = require('../../models/pedido/sql-vista/view_pedido');
const ViewDetallePedido = require('../../models/pedido/sql-vista/view_detalle');
const Pedido = require('../../models/pedido/pedido');
const Caja = require('../../models/pedido/caja');
const Factura = require('../../models/facturacion/factura');
const Cliente = require('../../models/facturacion/Cliente');
const DetallePedido = require('../../models/pedido/detallePedido');
const { emit } = require('../../helpers/notificar');
const Mesa = require('../../models/pedido/mesa');
const ViewMesa = require('../../models/pedido/sql-vista/view_mesa');
const { compilarTemplate } = require('../../helpers/compilarTemplate');
const puppeteer = require('puppeteer');
const dayjs = require('dayjs');

// Llamar todas las preguntas paginadas
const getInformaciónFactura = async (req = request, res = response) => {

    let { id_pedido } = req.query

    try {

        // Traer CAI activo
        const cai = await ViewSar.findAll();

        console.log(cai.NUMERO_ACTUAL == cai.RANGO_MAXIMO)
        
        // Traer Pedido
        const pedido = await ViewPedido.findByPk(id_pedido)

        // Traer Detalle
        const detalle = await ViewDetallePedido.findAll({
            where: {
                ID_PEDIDO: id_pedido
            }
        })

        // Respuesta
        res.json( {cai, pedido, detalle} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const validarPedido = async (req = request, res = response) => {
    const { id_pedido } = req.params

    try {
        const pedido = await Pedido.findByPk(id_pedido);

        if(!pedido) {
            return res.status(400).json(false)
        }

        if(pedido.ID_ESTADO != 4) {
            return res.status(400).json(false)
        }

        res.json(true)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const facturar = async (req = request, res = response) => {

    const {id_pedido} = req.params;
    const {
        cliente = "", 
        RTN = "", 
        direccion = "", 
        exonerado = false, 
        id_descuento = "", 
        descuento = 0, 
        venta_exenta = 0, 
        venta_gravada = 0, 
        isv = 0, 
        impBebida = 0, 
        total = 0, 
        id_pago = "",
        recibido = 0, 
        cambio = 0,
        conCAI = true
    } = req.body

    try {
        const caja = await Caja.findOne({where: {
            ESTADO: 1
        }})
    
        if(!caja) {
            return res.status(404).json({
                ok: false,
                msg: 'No hay una caja abierta para facturar'
            })
        }
    
        // Actualizar saldo de la caja
        await caja.update({
            SALDO_ACTUAL: parseFloat(caja.SALDO_ACTUAL) + parseFloat(total)
        })
    
        // Actualizar el CAI
        const cai = await ViewSar.findOne();
        // Actualizar 
        if(conCAI) {
    
            // Actualizar el CAI
            const cai = await ViewSar.findOne();
            let nuevoCai = parseInt(cai.NUMERO_ACTUAL.substring(11))
            nuevoCai++;
            await cai.update({
                NUMERO_ACTUAL: cai.NUMERO_ACTUAL.substring(0, cai.NUMERO_ACTUAL.length - nuevoCai.toString().length) + nuevoCai
            })
    
        }
    
        let clienteNuevoNuevo = {};
        if(cliente != "") {
    
            const clienteNuevo = await Cliente.create({
                DIRECCION: direccion,
                NOMBRE: cliente,
                RTN_CLIENTE: RTN,
                EXONERADO: false,
                DNI: RTN.substring(0, RTN.length-1)
            })
            
            clienteNuevoNuevo = clienteNuevo
        }
    
        // Crear Factura
        const factura = await Factura.create({
            ID_PEDIDO: id_pedido,
            ID_PAGO: id_pago,
            ID_DESCUENTO: id_descuento !== "" ? id_descuento : 1,
            ID_CLIENTE: cliente !== "" ? clienteNuevoNuevo.id : 1,
            NUM_FACTURA: conCAI ? cai.NUMERO_ACTUAL : '00000000000000',
            DESCUENTO_REBAJAS: descuento,
            VENTA_EXENTA: venta_exenta,
            VENTA_GRAVADA: venta_gravada,
            EXONERADO: exonerado,
            ISV: isv,
            IMPUESTO_SOBRE_BEBIDAS_Y_ALCOHOL: impBebida,
            TOTAL: total,
            RECIBIDO: recibido,
            CAMBIO: cambio
        })
    
        // Actualizar pedido y sus detalles
        await DetallePedido.update({
            ID_ESTADO: 5
        }, {where: {ID_PEDIDO: id_pedido}})
    
        const vistaPedido = await ViewPedido.findByPk(id_pedido)
        const listaViewPedidos = await ViewPedido.findAll({where:{ID_MESA: vistaPedido.ID_MESA}});
        
        await Pedido.update({
            ID_ESTADO: 5
        }, {where: {ID: id_pedido}})
    
        // Instanciar todos los pedidos de la mesa
        const pedidosMesa = await Pedido.findAll({
            order: [['ID_ESTADO', 'DESC']],       //El último siempre dira en que estado esta la orden
            where: { ID_MESA: vistaPedido.ID_MESA },
        });
    
        let idEstadoMesaNuevo = 5;
    
        for await (let pedidoMesa of pedidosMesa) {
            if (pedidoMesa.ID_ESTADO === 4) {
                // Servido
                idEstadoMesaNuevo = 4;
            } 
            
            if (pedidoMesa.ID_ESTADO === 3) {
                // Listo
                idEstadoMesaNuevo = 3;
            } else
            
            if (pedidoMesa.ID_ESTADO === 2) {
                // Cocinando
                idEstadoMesaNuevo = 2;
            } 
            
            if (pedidoMesa.ID_ESTADO === 1) {
                idEstadoMesaNuevo = 1
            }
        }
    
        // Instanciar mesa
        const mesa = await Mesa.findByPk(vistaPedido.ID_MESA);
        await mesa.update({
            ID_ESTADO: idEstadoMesaNuevo,
        });
        let idMesa = mesa.id;
        const mesaVista = await ViewMesa.findByPk(vistaPedido.ID_MESA);
        emit('recargarMesa', { idMesa, listaViewPedidos });
        emit("actualizarMesa", { idMesa, mesaVista });
    
        res.json({
            ok: true,
            msg: 'Pedido ha sido facturado con éxito, ¿Desea implimir la factura?'
        })
    } catch (error) {
        
    }
    
}

const imprimirFacturaPedido = async (req = request, res = response) => {
    const {id_pedido} = req.params;
    const {
        cliente = "", 
        RTN = "", 
        direccion = "", 
        exonerado = false, 
        id_descuento = "", 
        descuento = 0, 
        venta_exenta = 0, 
        venta_gravada = 0, 
        isv = 0, 
        impBebida = 0, 
        total = 0, 
        id_pago = "",
        recibido = 0, 
        cambio = 0,
        conCAI = true
    } = req.body

    try {
        
        const buscador = await puppeteer.launch({ headless: true });
        const pagina = await buscador.newPage();

        const infoFactura = {
            cliente, 
            RTN, 
            direccion, 
            exonerado, 
            id_descuento, 
            descuento, 
            venta_exenta, 
            venta_gravada, 
            isv, 
            impBebida, 
            total, 
            id_pago,
            recibido, 
            cambio,
            conCAI
        }

        const num_factura = await Factura.findOne({
            where: {
                ID_PEDIDO: id_pedido

            }
        });

        const detalle = await ViewDetallePedido.findAll({where: {
            ID_PEDIDO: id_pedido
        }})

        const detalleMapped = detalle.map((detalle) => {
            return {
                ID_PRODUCTO: detalle.ID_PRODUCTO,
                ID_ESTADO: detalle.ID_ESTADO,
                PARA_LLEVAR: detalle.PARA_LLEVAR,
                CANTIDAD: detalle.CANTIDAD,
                HORA: dayjs( detalle.HORA ).format('D MMM, YYYY, h:mm A'),
                TOTAL_IMPUESTO: detalle.TOTAL_IMPUESTO,
                PORCENTAJE_IMPUESTO: detalle.PORCENTAJE_IMPUESTO,
                PRECIO_DETALLE: detalle.PRECIO_DETALLE,
                INFORMACION: detalle.INFORMACION,
                NOMBRE_PRODUCTO: detalle.NOMBRE_PRODUCTO
            }
        })

        const cai = await ViewSar.findOne();

        const content = await compilarTemplate('factura', { detalle: detalleMapped, numero: num_factura.NUM_FACTURA,cliente, 
            RTN, CAI: cai.CAI, RANGO_MAXIMO: cai.RANGO_MAXIMO, RANGO_MINIMO: cai.RANGO_MINIMO, FECHA_LIMITE_EMISION: dayjs(cai.FECHA_LIMITE_EMISION).format('D MMM, YYYY'),
            direccion, 
            exonerado, 
            id_descuento, 
            descuento, 
            venta_exenta, 
            venta_gravada, 
            isv, 
            impBebida, 
            total, 
            id_pago,
            recibido, 
            cambio,
            conCAI })

        await pagina.setContent(content)
        const options = {
            string: true,
            headers: {
                "User-Agent": "my-app"
            }
        };

        // Traer enlace del loco
        const parametroLogo = await Parametro.findOne({
            where: { PARAMETRO: 'LOGO' }
        })

        // Traer nombre de la empresa
        const nombreEmpresa = await Parametro.findOne({
            where: { PARAMETRO: 'NOMBRE_EMPRESA' }
        })


        await pagina.emulateMediaType("print")
        const pdf = await pagina.pdf({
            format: 'A6',
            landscape: true,
            printBackground: true,
        })

        await buscador.close()
        console.log('descargar')

        res.contentType("application/pdf");
        res.send(pdf);

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getInformaciónFactura,
    validarPedido,
    facturar,
    imprimirFacturaPedido
}
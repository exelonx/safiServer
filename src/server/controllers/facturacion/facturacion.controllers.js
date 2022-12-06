const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');
const numeros_letras = require('jc_numeros_letras')

const Parametro = require("../../models/seguridad/parametro");
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewSar = require('../../models/facturacion/sql_views/view_sar');
const ViewPedido = require('../../models/pedido/sql-vista/view_pedido');
const ViewDetallePedido = require('../../models/pedido/sql-vista/view_detalle');
const Pedido = require('../../models/pedido/pedido');
const Caja = require('../../models/pedido/caja');
const Factura = require('../../models/facturacion/factura');
const Cliente = require('../../models/facturacion/cliente');
const DetallePedido = require('../../models/pedido/detallePedido');
const { emit } = require('../../helpers/notificar');
const Mesa = require('../../models/pedido/mesa');
const ViewMesa = require('../../models/pedido/sql-vista/view_mesa');
const { compilarTemplate } = require('../../helpers/compilarTemplate');
const puppeteer = require('puppeteer');
const dayjs = require('dayjs');
const Facturacion = require('../../models/facturacion/facturacion');
const ViewFacturacion = require('../../models/facturacion/sql_views/view_facturacion');

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
        ordenCompra = 0,
        numReg = "",
        consReg = "",
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
        conCAI = true,
        subTotal = 0
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

        if((ordenCompra != 0) && (numReg != "") && (consReg != "")) { // SI ES EXONERADO

            // Actualizar saldo de la caja
            await caja.update({
                SALDO_ACTUAL: parseFloat(caja.SALDO_ACTUAL) + parseFloat(total) - (parseFloat(isv)+parseFloat(impBebida))
            })
            
        } else {    // SI NO ES EXONERADO

            // Actualizar saldo de la caja
            await caja.update({
                SALDO_ACTUAL: parseFloat(caja.SALDO_ACTUAL) + parseFloat(total)
            })

        }
    
        // Actualizar el CAI
        const cai = await ViewSar.findOne();

        // SI EXISTE CAI
        if(cai) {

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
        const factura = await Facturacion.create({
            ID_PEDID: id_pedido,
            ID_PAG: id_pago,
            ID_DESCUENT: id_descuento !== "" ? id_descuento : 1,
            ID_CAII: conCAI ? cai.ID : 1,
            ID_CLIENT: cliente !== "" ? clienteNuevoNuevo.id : 1,
            NUM_FACTURA: conCAI ? cai.NUMERO_ACTUAL : '00000000000000',
            DESCUENTO_REBAJAS: descuento,
            VENTA_EXENTA: venta_exenta,
            VENTA_GRAVADA: venta_gravada,
            EXONERADO: !(ordenCompra != 0 && numReg != "" && consReg != "") ? 0.00 : parseFloat(isv)+parseFloat(impBebida),
            ISV: !(ordenCompra != 0 && numReg != "" && consReg != "") ? isv : 0.00,
            IMPUESTO_SOBRE_BEBIDAS_Y_ALCOHOL: !(ordenCompra != 0 && numReg != "" && consReg != "") ? impBebida : 0.00,
            SUBTOTAL: subTotal,
            TOTAL: !(ordenCompra != 0 && numReg != "" && consReg != "") ? total : parseFloat(total) - (parseFloat(isv)+parseFloat(impBebida)) ,
            RECIBIDO: recibido,
            CAMBIO: !(ordenCompra != 0 && numReg != "" && consReg != "") ? cambio : parseFloat(recibido) - (parseFloat(total) - (parseFloat(isv)+parseFloat(impBebida))) ,
            ORDEN_COMPRA_EXENTA: ordenCompra,
            NUMERO_REGISTROS_SAG: numReg,
            CONSTANCIA_REGISTRO_EXONERADO: consReg
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

    try {
        
        const buscador = await puppeteer.launch({ headless: true });
        const pagina = await buscador.newPage();

        const pedido = await ViewPedido.findByPk(id_pedido)

        const horaPedido = dayjs( pedido.HORA_SOLICITUD ).format('D MMM, YYYY, h:mm A')

        const infoFactura = await ViewFacturacion.findOne({
            where: {
                ID_PEDIDO: id_pedido
            }
        })

        const facturaMapped = {
                FORMA_PAGO: infoFactura.FORMA_PAGO,
                NOMBRE: infoFactura.NOMBRE,
                DIRECCION: infoFactura.DIRECCION,
                RTN_CLIENTE: infoFactura.RTN_CLIENTE,
                CAI: infoFactura.CAI,
                RANGO_MINIMO: infoFactura.RANGO_MINIMO,
                RANGO_MAXIMO: infoFactura.RANGO_MAXIMO,
                FECHA_LIMITE_EMISION: dayjs( infoFactura.FECHA_LIMITE_EMISION ).format('D/MM/YYYY'),
                NUM_FACTURA: infoFactura.NUM_FACTURA,
                DESCUENTO_REBAJAS: infoFactura.DESCUENTO_REBAJAS,
                VENTA_EXENTA: infoFactura.VENTA_EXENTA,
                VENTA_GRAVADA: infoFactura.VENTA_GRAVADA,
                EXONERADO: infoFactura.EXONERADO,
                ISV: infoFactura.ISV,
                IMPUESTO_SOBRE_BEBIDAS_Y_ALCOHOL: infoFactura.IMPUESTO_SOBRE_BEBIDAS_Y_ALCOHOL,
                SUBTOTAL: infoFactura.SUBTOTAL,
                TOTAL: infoFactura.TOTAL,
                RECIBIDO: infoFactura.RECIBIDO,
                CAMBIO: infoFactura.CAMBIO,
                ORDEN_COMPRA_EXENTA: infoFactura.ORDEN_COMPRA_EXENTA,
                NUMERO_REGISTROS_SAG: infoFactura.NUMERO_REGISTROS_SAG,
                CONSTANCIA_REGISTRO_EXONERADO: infoFactura.CONSTANCIA_REGISTRO_EXONERADO
        }

        const detalle = await ViewDetallePedido.findAll({where: {
            ID_PEDIDO: id_pedido
        }})

        const detalleMapped = detalle.map((detalle) => {
            return {
                ID_PRODUCTO: detalle.ID_PRODUCTO,
                ID_ESTADO: detalle.ID_ESTADO,
                PARA_LLEVAR: detalle.PARA_LLEVAR,
                CANTIDAD: detalle.CANTIDAD,
                HORA: dayjs( detalle.HORA ).format('D MM, YYYY, h:mm A'),
                TOTAL_IMPUESTO: detalle.TOTAL_IMPUESTO,
                PORCENTAJE_IMPUESTO: detalle.PORCENTAJE_IMPUESTO,
                PRECIO_DETALLE: detalle.PRECIO_DETALLE,
                INFORMACION: detalle.INFORMACION,
                NOMBRE_PRODUCTO: detalle.NOMBRE_PRODUCTO
            }
        })

        // Parametro
        const celular = await Parametro.findOne({ where: { PARAMETRO: 'NUMERO_CELULAR' } })
        const celularValor = celular.VALOR;
        const RTN = await Parametro.findOne({ where: { PARAMETRO: 'RTN'} })
        const rtnVALOR = RTN.VALOR;
        const correo = await Parametro.findOne({ where: { PARAMETRO: 'ADMIN_CORREO'} })
        const correoValor = correo.VALOR;
        const nombreEmpresa = await Parametro.findOne({ where: { PARAMETRO: 'NOMBRE_EMPRESA'} })
        const nombreValor = nombreEmpresa.VALOR;

        let arregloTotalLetra = parseFloat(facturaMapped.TOTAL).toFixed(2).split('.');
        let totalLetra = numeros_letras.numeros_letras(parseInt(arregloTotalLetra[0]))+'CON '+arregloTotalLetra[1]+'/100'

        const content = await compilarTemplate('factura', { detalle: detalleMapped, facturaMapped, horaPedido, celularValor, rtnVALOR, correoValor, nombreValor, totalLetra })

        await pagina.setContent(content)
        const options = {
            string: true,
            headers: {
                "User-Agent": "my-app"
            }
        };

        await pagina.emulateMediaType("print")

        const pdf = await pagina.pdf({
            width: '302px',
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

const getFacturas = async (req = request, res = response) => {
    
    let { limite = 10, desde = 0, buscar = "", quienBusco = "", fechaInicial ="", fechaFinal="" } = req.query
    let filtrarPorFecha = {};

    try {

        // Definir el número de objetos a mostrar
        if(!limite || limite === ""){
            const { VALOR } = await Parametro.findOne({where: {PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
            limite = VALOR;
        }

        if(desde === ""){
            desde = 0;
        }


        console.log(fechaFinal, fechaInicial);

        // Validar si llegaron fechas
        if( fechaFinal !== '' && fechaInicial !== '') {
            filtrarPorFecha = { 
                
                HORA_SOLICITUD: {

                    [Op.between]:[new Date(fechaInicial), new Date(fechaFinal)]

                }
 
            }
        }

        // Paginación
        const facturas = await ViewFacturacion.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            order: [['ID', 'DESC']],
            where: {
                [Op.and]: [filtrarPorFecha]
            },
            
        });

        // Contar resultados total
        const countFactura = await ViewFacturacion.count({
            where: {
                [Op.and]: [filtrarPorFecha]
            },
            
        });

        // Respuesta
        res.json( {limite, countFactura, facturas} )

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
    imprimirFacturaPedido,
    getFacturas
}
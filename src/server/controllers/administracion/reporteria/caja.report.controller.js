const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const base64 = require('node-base64-image');

// Importar librerias de fechas
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

const cajaModel = require('../../../models/pedido/caja')
const Parametro = require('../../../models/seguridad/parametro');

const { compilarTemplate } = require('../../../helpers/compilarTemplate');
const Caja = require('../../../models/pedido/caja');
const ViewFacturacion = require('../../../models/facturacion/sql_views/view_facturacion');

const getReporteCaja = async (req = request, res = response) => {

    let { buscar = "", fechaInicial = "", fechaFinal = "" } = req.body
    let filtrarPorFecha = {}

    try {

        const buscador = await puppeteer.launch({headless: true});
        const pagina = await buscador.newPage();

        // Validar si llegaron fechas
        if( fechaFinal !== '' && fechaInicial !== '') {
            filtrarPorFecha = { 
                
                FECHA_APERTURA: {

                    [Op.between]:[new Date(fechaInicial), new Date(fechaFinal)]

                }
 
            }
        }

        const caja = await cajaModel.findAll({
            where: {
                [Op.or]: [{                    
                    FECHA_APERTURA: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    SALDO_APERTURA: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    FECHA_CIERRE: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    SALDO_CIERRE: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    ESTADO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    SALDO_ACTUAL: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }],
                [Op.and]: [filtrarPorFecha]
            }
        })
        
        const cajaMapped = caja.map(( cajas )=> {
            return {
                SALDO_APERTURA: cajas.SALDO_APERTURA,
                SALDO_ACTUAL: cajas.SALDO_APERTURA,
                ESTADO: cajas.ESTADO,
                SALDO_CIERRE: cajas.SALDO_CIERRE,
                FECHA_APERTURA: dayjs(cajas.FECHA_APERTURA).format('D MMM, YYYY , h:mm A'),
                /* FECHA_APERTURA1: dayjs(cajas.FECHA_APERTURA).format('h:mm A'), */
                FECHA_CIERRE: dayjs(cajas.FECHA_CIERRE).format('h:mm A'),
                /* FECHA_CIERRE1: dayjs(cajas.FECHA_CIERRE).format('h:mm A'), */
            }
        })

        const content = await compilarTemplate('caja', {cajas: cajaMapped})
    
        await pagina.setContent(content)
        const options = {
            string: true,
            headers: {
              "User-Agent": "my-app"
            }
          };

        // Traer enlace del loco
        const parametroLogo = await Parametro.findOne({
            where: { PARAMETRO: 'LOGO'}
        })

        // Traer nombre de la empresa
        const nombreEmpresa = await Parametro.findOne({
            where: { PARAMETRO: 'NOMBRE_EMPRESA'}
        })

        // Convertir logo a base 64
        const logo = await base64.encode(parametroLogo.VALOR, options);

        await pagina.emulateMediaType("print")
        const pdf = await pagina.pdf({
            format: 'A4',
            landscape: true,

            margin: {
                top: '100px',
                bottom: '100px',
            },
            displayHeaderFooter: true,
            printBackground: true,
            headerTemplate: `
            <div style="font-size:10px; margin: 0 auto; margin-left: 20px; margin-right: 20px;  width: 100%; display: flex; align-items: center; justify-content: space-between;" >  
            <div style="color: #d12609; width: 22%;"><p>Fecha: <span class="date"></span></p></div>   
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">${nombreEmpresa.VALOR}</div> <div style="color: #d12609; font-size: 20px;">Reporte de Caja</div></div>   
            <div style=" display: flex; justify-content: end;  width: 20%;">
            <img class="logo" alt="title" src="data:image/png;base64,${logo}" width="40"/>
            </div></div>`,
            footerTemplate: `<div style="font-size:10px; display: flex; justify-content: end;  width: 100%; margin-left: 20px; margin-right: 20px;">
            <p>Página # <span class="pageNumber"></span> de <span class="totalPages"></span></p>
            </div>`
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

const getReporteCajaCerrada = async (req = request, res = response) => {

    let { idCaja = 0 } = req.body

    try {

        // === Contadores ===
        // Método de pago
        let efectivo = 0;
        let tarjeta = 0;
        let transferencia = 0;
        // Datos generales
        let mesa = 0;
        let totalMesa = 0;
        let mostrador = 0;
        let totalMostrador = 0;
        let clientes = 0;

        const buscador = await puppeteer.launch({headless: true});
        const pagina = await buscador.newPage();

        const caja = await Caja.findOne({
            where: {
                id: idCaja
            }
        })

        // Saldo inicial
        efectivo = parseFloat(caja.SALDO_APERTURA)

        const pedidosCaja = await ViewFacturacion.findAll({
            where: {
                ID_CAJA: caja.id
            }
        })

        for await(pedido of pedidosCaja) {
            // == Métodos de pago ==
            if( pedido.ID_PAGO === 1 ) {        // Efectivo
                efectivo += parseFloat(pedido.TOTAL);
            } else if( pedido.ID_PAGO === 2 ) { // Tarjeta
                tarjeta += parseFloat(pedido.TOTAL);
            } else {                            // Transferencia
                transferencia += parseFloat(pedido.TOTAL);
            }  

            // Tipo de pedido
            if( pedido.TIPO === 'MESA' ) {
                mesa++;
                //Incrementar total ingresado en tipo mesa
                totalMesa += parseFloat(pedido.TOTAL)
            } else {
                mostrador++;
                //Incrementar total ingresado en tipo Mostrador
                totalMostrador += parseFloat(pedido.TOTAL)
            }
        }

        // Traer la cantidad de clientes
        clientes = pedidosCaja.length;

        const cajaInfo = {
            efectivo,
            tarjeta,
            transferencia,
            mesa,
            totalMesa,
            mostrador,
            totalMostrador,
            clientes,
            horaApertura: dayjs(caja.FECHA_APERTURA).format('D MMM, YYYY , h:mm A'),
            horaCierre: dayjs(caja.FECHA_CIERRE).format('D MMM, YYYY , h:mm A'),
            saldoCierre: caja.SALDO_CIERRE,
            saldoApertura: caja.SALDO_APERTURA
        }
        
        const content = await compilarTemplate('unaCaja', {cajaInfo})
    
        await pagina.setContent(content)
        const options = {
            string: true,
            headers: {
              "User-Agent": "my-app"
            }
          };

        // Traer enlace del loco
        const parametroLogo = await Parametro.findOne({
            where: { PARAMETRO: 'LOGO'}
        })

        // Traer nombre de la empresa
        const nombreEmpresa = await Parametro.findOne({
            where: { PARAMETRO: 'NOMBRE_EMPRESA'}
        })

        // Convertir logo a base 64
        const logo = await base64.encode(parametroLogo.VALOR, options);

        await pagina.emulateMediaType("print")
        const pdf = await pagina.pdf({
            format: 'A4',

            margin: {
                top: '100px',
                bottom: '100px',
            },
            displayHeaderFooter: true,
            printBackground: true,
            headerTemplate: `
            <div style="font-size:10px; margin: 0 auto; margin-left: 20px; margin-right: 20px;  width: 100%; display: flex; align-items: center; justify-content: space-between;" >  
            <div style="color: #d12609; width: 22%;"><p>Fecha: <span class="date"></span></p></div>   
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">${nombreEmpresa.VALOR}</div> <div style="color: #d12609; font-size: 20px;">Reporte de Caja</div></div>   
            <div style=" display: flex; justify-content: end;  width: 20%;">
            <img class="logo" alt="title" src="data:image/png;base64,${logo}" width="40"/>
            </div></div>`,
            footerTemplate: `<div style="font-size:10px; display: flex; justify-content: end;  width: 100%; margin-left: 20px; margin-right: 20px;">
            <p>Página # <span class="pageNumber"></span> de <span class="totalPages"></span></p>
            </div>`
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
    getReporteCaja,
    getReporteCajaCerrada
}
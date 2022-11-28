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

const getReporteCaja = async (req = request, res = response) => {

    let { buscar = "" } = req.body

    try {

        const buscador = await puppeteer.launch({headless: true});
        const pagina = await buscador.newPage();

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
                }/* , {
                    FECHA_APERTURA1: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    FECHA_CIERRE1: { [Op.like]: `%${buscar.toUpperCase()}%`}
                } */]
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

module.exports = {
    getReporteCaja
}
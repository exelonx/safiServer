const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const base64 = require('node-base64-image');
const Parametro = require('../../models/seguridad/parametro');
const { eventBitacora } = require('../../helpers/event-bitacora');

// Importar librerias de fechas
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

const { compilarTemplate } = require('../../helpers/compilarTemplate');

const ViewParametro = require('../../models/seguridad/sql-vistas/view-parametro')

// Llamar todas los parametros
const getReporteParametro = async (req = request, res = response) => {
    let { buscar = "", id_usuario } = req.body

    try {

        const buscador = await puppeteer.launch({headless: true});
        const pagina = await buscador.newPage();

        const registros = await ViewParametro.findAll({
            where: {
                 // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
                 [Op.or]: [{
                    PARAMETRO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    VALOR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });

        // formato local
        dayjs.extend(localizedFormat)
        
        const regristrosMapped = registros.map(( registro )=> {
            return {
                PARAMETRO: registro.PARAMETRO,
                VALOR: registro.VALOR,
                CREADO_POR: registro.CREADO_POR,
                FECHA_CREACION: dayjs(registro.FECHA_CREACION).format('D MMM, YYYY, h:mm A'), 
                MODIFICADO_POR: registro.MODIFICADO_POR,
                FECHA_MODIFICACION: dayjs(registro.FECHA_MODIFICACION).format('D MMM, YYYY, h:mm A'), 
            }
        })

        const content = await compilarTemplate('parametro', {parametro: regristrosMapped})
    
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
            format: 'Tabloid',
            landscape: true,

            margin: {
                top: '100px',
                bottom: '100px',
            },
            displayHeaderFooter: true,
            printBackground: true,
            headerTemplate: `
            <div style="font-size:10px; margin: 0 auto; margin-left: 20px; margin-right: 20px; width: 100%; display: flex; align-items: center; justify-content: space-between;" >  
            <div style="color: #d12609; width: 22%;"><p>Fecha: <span class="date"></span></p></div>   
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">${nombreEmpresa.VALOR}</div> <div style="color: #d12609; font-size: 20px;">Reporte de Parámetros</div></div>   
            <div style=" display: flex; justify-content: end;  width: 20%;">
            <img class="logo" alt="title" src="data:image/png;base64,${logo}" width="40"/>
            </div></div>`,
            footerTemplate: `<div style="font-size:10px; display: flex; justify-content: end;  width: 100%; margin-left: 20px; margin-right: 20px;">
            <p>Página # <span class="pageNumber"></span> de <span class="totalPages"></span></p>
            </div>`
        })


        await buscador.close()
        console.log('descargar')

        eventBitacora(new Date, id_usuario, 10, 'REPORTE', `SE GENERÓ UN REPORTE DE PARÁMETROS`);

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
    getReporteParametro
}
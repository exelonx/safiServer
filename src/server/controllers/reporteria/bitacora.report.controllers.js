const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const base64 = require('node-base64-image');

// Importar librerias de fechas
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

const { compilarTemplate } = require('../../helpers/compilarTemplate');

const ViewBitacora = require('../../models/administracion/sql-vistas/view_bitacora');
const Parametro = require('../../models/seguridad/parametro');
const { eventBitacora } = require('../../helpers/event-bitacora');

// Llamar todas los parametros
const getReporteBitacora = async (req = request, res = response) => {
    let { buscar = "", fechaInicial = "", fechaFinal = "", id_usuario } = req.body
    let filtrarPorFecha = {}
    
    try {

        const buscador = await puppeteer.launch({headless: true});
        const pagina = await buscador.newPage();

        // Validar si llegaron fechas
        if( fechaFinal !== '' && fechaInicial !== '') {
            filtrarPorFecha = { 
                FECHA: {
                    [Op.between]: [new Date(fechaInicial), new Date(fechaFinal)]
                }
            }
        }

        const registros = await ViewBitacora.findAll({
            where: {
                // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
                [Op.or]: [{
                    USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    OBJETO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    ACCION: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    DESCRIPCION: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }],
                [Op.and]: [filtrarPorFecha]
            }
        })

        // formato local
        dayjs.extend(localizedFormat)
        
        const regristrosMapped = registros.map(( registro )=> {
            return {
                FECHA: dayjs(registro.FECHA).format('D MMM, YYYY, h:mm A'),
                USUARIO: registro.USUARIO,
                OBJETO: registro.OBJETO,
                ACCION: registro.ACCION,
                DESCRIPCION: registro.DESCRIPCION
            }
        })

        const content = await compilarTemplate('bitacora', {registros: regristrosMapped})
    
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
            timeout: 0,
            displayHeaderFooter: true,
            printBackground: true,
            headerTemplate: `
            <div style="font-size:10px; margin: 0 auto; margin-left: 20px; margin-right: 20px;  width: 100%; display: flex; align-items: center; justify-content: space-between;" >  
            <div style="color: #d12609; width: 22%;"><p>Fecha: <span class="date"></span></p></div>   
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">${nombreEmpresa.VALOR}</div> <div style="color: #d12609; font-size: 20px;">Reporte de Usuarios</div></div>   
            <div style=" display: flex; justify-content: end;  width: 20%;">
            <img class="logo" alt="title" src="data:image/png;base64,${logo}" width="40"/>
            </div></div>`,
            footerTemplate: `<div style="font-size:10px; display: flex; justify-content: end;  width: 100%; margin-left: 20px; margin-right: 20px;">
            <p>Página # <span class="pageNumber"></span> de <span class="totalPages"></span></p>
            </div>`
        })

        await buscador.close()
        console.log('descargar')

        eventBitacora(new Date, id_usuario, 11, 'REPORTE', `SE GENERÓ UN REPORTE DE BITÁCORA`);

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
    getReporteBitacora
}
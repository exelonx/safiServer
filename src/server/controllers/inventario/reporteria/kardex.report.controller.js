const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const base64 = require('node-base64-image');

// Importar librerias de fechas
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

const viewKardex = require('../../../models/inventario/sql-vista/view_kardex')
const Parametro = require('../../../models/seguridad/parametro');

const { compilarTemplate } = require('../../../helpers/compilarTemplate');

const getReporteKardex = async (req = request, res = response) => {

    let { buscar = "", fechaInicial = "", fechaFinal = "" } = req.body
    let filtrarPorFecha = {}

    try {

        // Validar si llegaron fechas
        if( fechaFinal !== '' && fechaInicial !== '') {
            filtrarPorFecha = { 
                FECHA_Y_HORA: {
                    [Op.between]: [new Date(fechaInicial), new Date(fechaFinal)]
                }
            }
        }

        const buscador = await puppeteer.launch({headless: true});
        const pagina = await buscador.newPage();

        const kardex = await viewKardex.findAll({
            where: {
                // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
                [Op.or]: [{
                    USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    TIPO_MOVIMIENTO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }],
                [Op.and]: [filtrarPorFecha]
            }
        });

        
        const kardexMapped = kardex.map(( kardexs )=> {
            return {
                USUARIO: kardexs.USUARIO,
                ID_INSUMO: kardexs.ID_INSUMO,
                NOMBRE: kardexs.NOMBRE,
                UNIDAD_MEDIDA: kardexs.UNIDAD_MEDIDA,
                CANTIDAD: kardexs.CANTIDAD,
                TIPO_MOVIMIENTO: kardexs.TIPO_MOVIMIENTO,
                FECHA_Y_HORA: dayjs(kardexs.FECHA_Y_HORA).format('D MMM, YYYY , h:mm A')
            }
        })

        const content = await compilarTemplate('kardex', {kardexs: kardexMapped})
    
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
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">${nombreEmpresa.VALOR}</div> <div style="color: #d12609; font-size: 20px;">Reporte de movimientos de inventario</div></div>   
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
    getReporteKardex
}
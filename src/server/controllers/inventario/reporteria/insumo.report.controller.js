const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const base64 = require('node-base64-image');

// Importar librerias de fechas
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

const { compilarTemplate } = require('../../../helpers/compilarTemplate');
const ViewInsumo = require('../../../models/inventario/sql-vista/view-insumo');
const Parametro = require('../../../models/seguridad/parametro');

// Llamar todas los parametros
const getReporteInsumo = async (req = request, res = response)=>{

    let{buscar = ""} = req.body

    try {
        
        const buscador = await puppeteer.launch({headless: true});
        const pagina = await buscador.newPage();

        const registros = await ViewInsumo.findAll({

            where: {
                // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    UNIDAD_MEDIDA: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CANTIDAD_MAXIMA: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CANTIDAD_MINIMA: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }

        })

        const regristrosMapped = registros.map(( registro )=> {
            return {
                NOMBRE: registro.NOMBRE,
                UNIDAD_MEDIDA: registro.UNIDAD_MEDIDA,
                CANTIDAD_MAXIMA: registro.CANTIDAD_MAXIMA,
                CANTIDAD_MINIMA: registro.CANTIDAD_MINIMA,
                CREADO_POR: registro.CREADO_POR,
                FECHA_CREACION: registro.FECHA_CREACION,
                MODIFICADO_POR: registro.MODIFICADO_POR,
                FECHA_MODIFICACION: registro.FECHA_MODIFICACION

            }
        })

        const content = await compilarTemplate('insumo', {registro: regristrosMapped})

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
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">${nombreEmpresa.VALOR}</div> <div style="color: #d12609; font-size: 20px;">Reporte de Insumos</div></div>   
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
    getReporteInsumo
}
const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const base64 = require('node-base64-image');

const ViewNotificacionUsuario = require('../../../models/notificacion/sql-vistas/view_notificacion_usuario');
const Parametro = require('../../../models/seguridad/parametro');

// Importar librerias de fechas
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

const { compilarTemplate } = require('../../../helpers/compilarTemplate');
const { eventBitacora } = require('../../../helpers/event-bitacora');

const getReporteNotificacion = async (req = request, res = response) => {

    let { buscar = "", id_usuario } = req.body

    try {

        const {
            id_usuario
        }=req.body

        const buscador = await puppeteer.launch({ headless: true });
        const pagina = await buscador.newPage();

        const notificacion = await ViewNotificacionUsuario.findAll({
            where: {
                ID_USUARIO: id_usuario,
                [Op.or]: [{
                    USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    VISTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    RESPONSABLE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    INSUMO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    ACCION: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    DETALLE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    TIEMPO_TRANSCURRIDO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    TIPO_NOTIFICACION: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]                
            }
        });


        const notificacionMapped = notificacion.map((notificaciones) => {
            return {
                USUARIO: notificaciones.USUARIO,
                VISTO: notificaciones.VISTO,
                RESPONSABLE: notificaciones.RESPONSABLE,
                ID_INSUMO: notificaciones.ID_INSUMO,
                INSUMO: notificaciones.INSUMO,
                ACCION: notificaciones.ACCION,
                DETALLE: notificaciones.DETALLE,
                TIPO_NOTIFICACION: notificaciones.TIPO_NOTIFICACION,
                TIEMPO_TRANSCURRIDO: dayjs(notificaciones.TIEMPO_TRANSCURRIDO).format('h:mm A')
            }
        })

        const content = await compilarTemplate('notificacion', { notificaciones: notificacionMapped })

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
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">${nombreEmpresa.VALOR}</div> <div style="color: #d12609; font-size: 20px;">Reporte de de  Notificaciones</div></div>   
            <div style=" display: flex; justify-content: end;  width: 20%;">
            <img class="logo" alt="title" src="data:image/png;base64,${logo}" width="40"/>
            </div></div>`,
            footerTemplate: `<div style="font-size:10px; display: flex; justify-content: end;  width: 100%; margin-left: 20px; margin-right: 20px;">
            <p>Página # <span class="pageNumber"></span> de <span class="totalPages"></span></p>
            </div>`
        })

        await buscador.close()
        console.log('descargar')

        eventBitacora(new Date, id_usuario, 19, 'REPORTE', `SE GENERÓ UN REPORTE DE NOTIFICACIONES`);

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
    getReporteNotificacion
}
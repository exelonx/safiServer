const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const base64 = require('node-base64-image');
const { eventBitacora } = require('../../helpers/event-bitacora');

const ViewPermisoNotificacion = require(`../../models/notificacion/sql-vistas/view_permiso_notificacion`);
const Parametro = require('../../models/seguridad/parametro');

// Importar librerias de fechas
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

const { compilarTemplate } = require('../../helpers/compilarTemplate');

const getReportePermisoNoti = async (req = request, res = response) => {

    let { id_rol = "",
        id_tipo = "",
        mostrarTodos = false,
        id_usuario } = req.body
    let filtrarPorRol = {};
    let filtrarPorTipo = {}, buscar = "";

    try {

        if (id_rol !== "" && mostrarTodos == false) {
            filtrarPorRol = {
                ID_ROL: id_rol,
            };
        }

        if (id_tipo !== '') {
            filtrarPorTipo = {
                ID_TIPO_NOTIFICACION: id_tipo
            }
        }

        const buscador = await puppeteer.launch({ headless: true });
        const pagina = await buscador.newPage();

        const permisoNoti = await ViewPermisoNotificacion.findAll({
            where: {
                [Op.or]: [{
                    ROL: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    TIPO_NOTIFICACION: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }],
                [Op.and]: [filtrarPorRol, filtrarPorTipo]
            }
        });


        const permisoNotiMapped = permisoNoti.map((permisoNotis) => {
            return {
                ROL: permisoNotis.ROL,
                ID_TIPO_NOTIFICACION: permisoNotis.ID_TIPO_NOTIFICACION,
                TIPO_NOTIFICACION: permisoNotis.TIPO_NOTIFICACION,
                RECIBIR_NOTIFICACION: permisoNotis.RECIBIR_NOTIFICACION,
                CREADO_POR: permisoNotis.CREADO_POR,
                FECHA_CREACION: dayjs(permisoNotis.FECHA_CREACION).format('D MMM, YYYY, h:mm A'),
                MODIFICADO_POR: permisoNotis.MODIFICADO_POR,
                FECHA_MODIFICACION: dayjs(permisoNotis.FECHA_MODIFICACION).format('D MMM, YYYY, h:mm A')
            }
        })

        const content = await compilarTemplate('permisoNoti', { permisoNotis: permisoNotiMapped })

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
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">${nombreEmpresa.VALOR}</div> <div style="color: #d12609; font-size: 20px;">Reporte de Permisos de Notificaciones</div></div>   
            <div style=" display: flex; justify-content: end;  width: 20%;">
            <img class="logo" alt="title" src="data:image/png;base64,${logo}" width="40"/>
            </div></div>`,
            footerTemplate: `<div style="font-size:10px; display: flex; justify-content: end;  width: 100%; margin-left: 20px; margin-right: 20px;">
            <p>Página # <span class="pageNumber"></span> de <span class="totalPages"></span></p>
            </div>`
        })

        await buscador.close()
        console.log('descargar')

        eventBitacora(new Date, id_usuario, 9, 'REPORTE', `SE GENERÓ UN REPORTE DE NOTIFICACIONES DE PERMISOS`);

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
    getReportePermisoNoti
}
const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const base64 = require('node-base64-image');

const ViewPermiso = require(`../../models/seguridad/sql-vistas/view-permiso`);
const Parametro = require('../../models/seguridad/parametro');

const { compilarTemplate } = require('../../helpers/compilarTemplate');

const getReportePermiso = async (req = request, res = response) => {

    let { id_rol = "",
        id_pantalla = "", 
        mostrarTodos = false} = req.body
    let filtrarPorRol = {};
    let filtrarPorPantalla = {}, buscar = "";


    try {

        if (id_rol !== "" && mostrarTodos == false) {
            filtrarPorRol = {
                ID_ROL: id_rol,
            };
        }

        if (id_pantalla !== "") {
            filtrarPorPantalla = {
                ID_OBJETO: id_pantalla,
            };
        }

        const buscador = await puppeteer.launch({ headless: true });
        const pagina = await buscador.newPage();

        const permiso = await ViewPermiso.findAll({
            where: {
              [Op.or]: [
                {
                  ROL: { [Op.like]: `%${buscar.toUpperCase()}%` },
                },
                {
                  OBJETO: { [Op.like]: `%${buscar.toUpperCase()}%` },
                },
                {
                  CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` },
                },
                {
                  MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` },
                },
              ],
              [Op.and]: [filtrarPorRol, filtrarPorPantalla],
            },
          });


        const permisoMapped = permiso.map((permisos) => {
            return {
                ROL: permisos.ROL,
                ID_OBJETO: permisos.ID_OBJETO,
                OBJETO: permisos.OBJETO,
                PERMISO_INSERCION: permisos.PERMISO_INSERCION,
                PERMISO_ELIMINACION: permisos.PERMISO_ELIMINACION,
                PERMISO_ACTUALIZACION: permisos.PERMISO_ACTUALIZACION,
                PERMISO_CONSULTAR: permisos.PERMISO_CONSULTAR,
                CREADO_POR: permisos.CREADO_POR,
                FECHA_CREACION: permisos.FECHA_CREACION,
                MODIFICADO_POR: permisos.MODIFICADO_POR,
                FECHA_MODIFICACION: permisos.FECHA_MODIFICACION
            }
        })

        const content = await compilarTemplate('permiso', { permisos: permisoMapped })

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
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">${nombreEmpresa.VALOR}</div> <div style="color: #d12609; font-size: 20px;">Reporte de Permisos de Sistemas</div></div>   
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
    getReportePermiso
}
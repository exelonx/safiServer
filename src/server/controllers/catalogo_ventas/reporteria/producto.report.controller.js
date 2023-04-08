const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const base64 = require('node-base64-image');

const ViewProducto = require(`../../../models/catalogo-ventas/sql-vistas/view_producto`);
const Parametro = require('../../../models/seguridad/parametro');

const { compilarTemplate } = require('../../../helpers/compilarTemplate');
const ViewSoloProducto = require('../../../models/catalogo-ventas/sql-vistas/view_solo_producto');
const { eventBitacora } = require('../../../helpers/event-bitacora');

const getReporteProducto = async (req = request, res = response) => {

    let { buscar = "", id_usuario } = req.body

    try {

        const buscador = await puppeteer.launch({ headless: true });
        const pagina = await buscador.newPage();

        const producto = await ViewSoloProducto.findAll({
            where: {
                // WHERE PREGUNTA LIKE %${BUSCAR}% OR LIKE %${BUSCAR}%
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    DESCRIPCION: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    PRECIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    PORCENTAJE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    BEBIDA: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    SIN_ESTADO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        })


        const productoMapped = producto.map((productos) => {
            return {
                NOMBRE: productos.NOMBRE,
                PORCENTAJE: productos.PORCENTAJE,
                PRECIO: productos.PRECIO,
                EXENTA: productos.EXENTA,
                DESCRIPCION: productos.DESCRIPCION,
                ESTADO: productos.ESTADO,
                SIN_ESTADO: productos.SIN_ESTADO,
                BEBIDA: productos.BEBIDA,
                CREADO_POR: productos.CREADO_POR,
                FECHA_CREACION: productos.FECHA_CREACION,
                MODIFICADO_POR: productos.MODIFICADO_POR,
                FECHA_MODIFICACION: productos.FECHA_MODIFICACION
            }
        })

        const content = await compilarTemplate('producto', { productos: productoMapped })

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
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">${nombreEmpresa.VALOR}</div> <div style="color: #d12609; font-size: 20px;">Reporte de Productos</div></div>   
            <div style=" display: flex; justify-content: end;  width: 20%;">
            <img class="logo" alt="title" src="data:image/png;base64,${logo}" width="40"/>
            </div></div>`,
            footerTemplate: `<div style="font-size:10px; display: flex; justify-content: end;  width: 100%; margin-left: 20px; margin-right: 20px;">
            <p>Página # <span class="pageNumber"></span> de <span class="totalPages"></span></p>
            </div>`
        })

        await buscador.close()
        console.log('descargar')
        eventBitacora(new Date, id_usuario, 18, 'REPORTE', `SE GENERÓ UN REPORTE DE GESTIÓN DE PRODUCTOS DE TIPO PRODUCTO`)
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
    getReporteProducto
}
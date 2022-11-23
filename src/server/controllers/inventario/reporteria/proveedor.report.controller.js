const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');

// Importar librerias de fechas
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');

const { compilarTemplate } = require('../../../helpers/compilarTemplate');
const ViewProveedor = require('../../../models/inventario/sql-vista/view-proveedor');

// Llamar todas los parametros
const getReporteProveedor = async (req = request, res = response)=>{

    let{buscar = ""} = req.body

    try {
        
        const buscador = await puppeteer.launch({headless: true});
        const pagina = await buscador.newPage();

        const registros = await ViewProveedor.findAll({

            where: {
                // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }

        })

        const regristrosMapped = registros.map(( registro )=> {
            return {
                NOMBRE: registro.NOMBRE,
                CREADO_POR: registro.CREADO_POR,
                MODIFICACION_POR: registro.MODIFICACION_POR,
                DETALLE: registro.DETALLE,
                MUNICIPIO: registro.MUNICIPIO,
                DEPARTAMENTO: registro.DEPARTAMENTO,

            }
        })

        const content = await compilarTemplate('proveedor', {proveedor: regristrosMapped})

        await pagina.setContent(content)

        await pagina.emulateMediaType("print")
        const pdf = await pagina.pdf({
            format: 'A4', //Tamaño de página
            landscape: true, //Voltear Horizontal

            margin: {
                top: '100px',
                bottom: '100px',
            },
            displayHeaderFooter: true,
            printBackground: true,
            headerTemplate: `<div style="font-size:10px; margin: 0 auto; margin-left: 20px; margin-right: 20px;  width: 100%; display: flex; align-items: center; justify-content: space-between;" >  
            <div style="color: #d12609; width: 22%;"><p>Fecha: <span class="date"></span></p></div>   
            <div style="display: flex; width: 60%; margin: 0 auto; align-items: center; justify-content: center; flex-direction: column"><div style="font-weight: bold; font-size: 20px;">Dr. Burger</div> <div style="color: #d12609; font-size: 20px">Reporte de Proveedor</div></div>   
            <div style=" display: flex; justify-content: end;  width: 20%;">
            <svg id="Capa_1" style="width: 40%;" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550.51 496.91"><defs><style>.cls-1{fill:#1e120d;}.cls-2{fill:#d12609;}</style></defs><path class="cls-1" d="M266.38,533.18H692.82c-31.4,55.55-105.07,117.39-206.51,120C379.24,655.88,300.55,592.8,266.38,533.18Zm144.48,21.23h9a4.9,4.9,0,0,0,.22,1.37c.42.81,1,1.57,1.45,2.35a9.11,9.11,0,0,0,1.31-2.45,26.8,26.8,0,0,0,.05-4.26c-5.42,0-10.47-.06-15.52.05a10.48,10.48,0,0,0-3,1.07l2.82,3.11c0,3,.07,7,0,10.94-.05,1.74,1,4.2-2.24,4.49-.23,0-.33,1.54-.48,2.33h18.46a51.83,51.83,0,0,0-.06-5.19,1.92,1.92,0,0,0-1.28-1.35c-.47,0-1.17.71-1.4,1.26a8.8,8.8,0,0,0-.23,2.42H411v-7c2.21,0,4.18.11,6.13-.06.62-.06,1.17-.88,1.75-1.36-.57-.47-1.11-1.3-1.71-1.35-2.05-.17-4.11-.06-6.27-.06Zm16.61,18.69c2.46.24,4.55.31,6.58.69,4.06.75,7.75-1.22,8.62-4.78.93-3.75-1.05-6.89-5.23-8.23-1.47-.47-3.13-.6-4.4-1.38-1-.64-1.6-2-2.37-3.06,1.07-.77,2.18-2.2,3.21-2.15,1.58.08,3.17,1.08,4.65,1.88a15.21,15.21,0,0,1,2.4,2c.29-1.09.66-2.16.85-3.26a3.9,3.9,0,0,0-.07-2.28,2.73,2.73,0,0,0-1.81-1.24c-1.36-.21-2.81.11-4.15-.16-3.6-.74-7,.92-8,4.11-1.07,3.37.55,6.3,4.34,7.69,1.66.61,3.55.79,5,1.72,1.06.68,2.29,2.4,2.1,3.4a4.53,4.53,0,0,1-3,2.8c-2.69.52-4.51-1.07-5.63-3.57-.31-.71-1.16-1.18-1.77-1.76-.41.75-1.11,1.48-1.18,2.27A52.57,52.57,0,0,0,427.47,573.1Zm33.36-18.68a24.44,24.44,0,0,0,.07,4,2.23,2.23,0,0,0,1.41,1.35,1.73,1.73,0,0,0,1.35-1c.12-2.41.06-4.83.06-7.16H445.58c0,2.41-.09,4.6.06,6.78,0,.5.87,1,1.34,1.43.47-.48,1.26-.9,1.34-1.44a26.11,26.11,0,0,0,.07-4h4.49c0,5,0,9.82-.07,14.64,0,.58-.91,1.13-1.37,1.71s-.9,1.19-1.35,1.78c.56.37,1.11,1,1.68,1.06,2.4.12,4.81,0,7.21,0l.61-.92-2.93-3.19V554.42Zm77.76,12.09c.22,4.12,1.47,6.47,4.75,7.26a6.46,6.46,0,0,0,7.77-3.54,17.68,17.68,0,0,0,.32-15.06,6.71,6.71,0,0,0-9.09-3.58c-3.56,1.64-5.15,6.87-3.21,10.59,1.74,3.36,5.18,4.24,9.07,2.33.36-.18.73-.31,1.33-.56,0,.79.19,1.43,0,1.83-1,1.81-1.8,4.27-3.4,5.12-2.2,1.17-3.68-.85-4.67-2.94C541.13,567.35,540,567.17,538.59,566.51Zm-35.31-3.84a63.15,63.15,0,0,0,2.16,7.53,6.1,6.1,0,0,0,6.12,3.76,6.36,6.36,0,0,0,6.11-3.82,17.91,17.91,0,0,0,.09-15.08,6.84,6.84,0,0,0-12.54.08A59.46,59.46,0,0,0,503.28,562.67Zm-18.54,10.7h14.38c0-2.27.09-4.25-.06-6.22,0-.53-.81-1-1.24-1.5-.49.45-1.27.82-1.43,1.37a16.47,16.47,0,0,0-.3,3.28h-8.68c1.76-1.9,2.83-3.25,4.11-4.39,1.56-1.39,3.37-2.5,4.92-3.9,2.65-2.38,3.21-5.41,1.65-8s-5.29-3.73-8.52-2.64a6.54,6.54,0,0,0-4.37,6.69c.07.58.82,1.57,1.14,1.53a3.32,3.32,0,0,0,1.83-1.22c.29-.35-.06-1.23.23-1.58.92-1.08,1.87-2.59,3.06-2.86a4,4,0,0,1,3.51,1.56,4.73,4.73,0,0,1-.5,4.15c-1.41,1.76-3.48,3-5.25,4.5C486.39,566.51,484.63,569.41,484.74,573.37Zm42.58-3.56-2.93,2.51a13.5,13.5,0,0,0,3.12,1.3,19.3,19.3,0,0,0,4.62,0,1.71,1.71,0,0,0,1.23-1.11c.06-.47-.49-1.45-.8-1.47-2.52-.12-1.88-2-1.9-3.36,0-5.27,0-10.54,0-16.7l-6.25,1.56,2.92,2.79Zm-57.49,0c-4.2-.27-4.3-.16-3.41,3.59h3.41Z" transform="translate(-205.12 -156.33)"/><path class="cls-2" d="M241.93,400.06H230.09c3.17-75.79,32.87-138.54,91.38-186.85,77.42-63.91,186.6-75.34,275-27.28C680.71,231.7,723.58,304.41,729.58,400H717.51c-3.52-75-34-136.51-93.54-182.57-46-35.61-98.79-51.6-156.85-48.52-61.71,3.28-114.58,27.31-157.75,71.48S244.17,338.18,241.93,400.06Z" transform="translate(-205.12 -156.33)"/><path d="M471.49,222.36c.6-3.2-.52-5.32-2.67-7.29-7.52-6.83-16.65-8.41-26.05-6.89-23.35,3.79-45,12.11-61.91,29.2-17.07,17.28-24,38.68-21,62.85,1.95,15.59,12.57,27,26.92,30.13a24.48,24.48,0,0,0,4.59.54,24.21,24.21,0,0,1,13.6,4.57c6.09,4.29,10.35,4.21,16.43.08,9-6.1,17.47-6.11,26.47,0,6.15,4.15,10.37,4.15,16.45,0,9-6.09,17.47-6.09,26.48,0,6.11,4.13,10.37,4.13,16.45,0,9-6.09,17.51-6.18,26.46,0,4.95,3.44,10.06,4.46,15.06.82,8.58-6.26,17.25-7.43,26.58-1.49.66-1.06,1.21-2,1.8-2.89a17.35,17.35,0,1,1-1.51,16.05c-3.07-7.42-12.39-10.16-19.3-6-3.44,2.07-7.14,4.11-11,5-5.94,1.36-11.52-.37-16.57-4-6.29-4.48-10.34-4.36-16.7,0-8.8,6-17.32,6-26.21,0-6.36-4.32-10.31-4.3-16.72.05-8.83,6-17.27,6-26.22-.07-6.37-4.31-10.26-4.29-16.72.09-8.71,5.92-17.26,6-25.91,0a19.91,19.91,0,0,0-9.84-3.32c-17-1.62-29.14-10.38-36-26-6.17-14.1-5.44-28.79-1.85-43.31,6.27-25.36,21.08-44.21,44.42-56.13,14.72-7.52,29.87-13.92,46.61-15.33,11.81-1,22.61,1.42,31.65,9.75,3.29,3,5.2,6.49,5.26,11a16.37,16.37,0,0,0,.28,2.19c9.67,1.29,19.16,2.09,28.45,3.9,14.77,2.89,28.72,8.11,40.85,17.36,6.47,4.94,13.23,17.87,13.33,25.17.09,7.49-3.47,11.84-10.87,13a38,38,0,0,1-6,.32c-16.7,0-33.39,0-50.09.08a9,9,0,0,0-4.42,1.48c-2.47,1.55-5.4,1.52-7.26-.44a5.38,5.38,0,0,1,0-7.24c1.87-2,4.75-2,7.26-.39a8.25,8.25,0,0,0,4.13,1.39c16.91.1,33.83.06,50.75.06h1c9.45-.16,12.78-5.09,9.15-13.91-1.39-3.4-2.73-7.14-7.19-7.89a1.81,1.81,0,0,1-.81-.56c-13.7-12.77-30.66-18.16-48.58-21a162.44,162.44,0,0,0-59.7,1.71c-14.33,3.09-27.35,8.77-38.51,18.91-3.69,3.35-7,6.37-8.63,10.94-2.64,7.15,0,11.49,7.57,11.61,16.58.28,33.17.15,49.76.1a5,5,0,0,0,2.57-1.13c2.76-2,5.8-1.9,7.71.34a5.32,5.32,0,0,1-.15,7c-1.92,2.07-4.89,2.06-7.51.28a7.37,7.37,0,0,0-3.81-1.29c-15.26-.09-30.52,0-45.78-.09a32.42,32.42,0,0,1-7.87-.88c-6-1.57-9.25-6.6-8.51-12.81a7.08,7.08,0,0,1,.36-1.95c3.91-9.59,7.17-19.45,16.61-25.64,13.62-8.94,28.6-13.82,44.55-16C456.59,223.54,464,223.07,471.49,222.36ZM591.67,330.63a10.92,10.92,0,0,0-10.87,11,11.08,11.08,0,0,0,10.89,10.76,11,11,0,0,0,11-10.95A10.76,10.76,0,0,0,591.67,330.63Z" transform="translate(-205.12 -156.33)"/><path class="cls-2" d="M741.71,463c7.37,3.92,9.6,9.89,9.58,17.17,0,9.16-.18,18.35.43,27.48.3,4.36,2.27,8.61,3.39,12.93a35.15,35.15,0,0,1,.52,4.43c-8.11,0-15.71.1-23.3-.13-.93,0-2.36-1.73-2.6-2.87a71.52,71.52,0,0,1-2.05-13c-.29-10.05-.08-20.11-.09-30.17,0-4.71-2.42-6.68-7.46-5.89v51.55H695.61v-6c0-34.39,0-68.77-.08-103.16,0-3.3,1-4.09,4.11-4,10.27.32,20.57.09,30.82.67,3.84.21,7.75,1.69,11.33,3.27,6.12,2.69,9.18,7.72,9.28,14.45.07,5.08-.11,10.18.15,15.25C751.61,452.64,749.53,459,741.71,463Zm-21.47-33.21v24.86c4.77.57,7.26-1.42,7.34-5.8.07-4.08,0-8.16,0-12.24C727.57,431.58,725.81,429.88,720.24,429.79Z" transform="translate(-205.12 -156.33)"/><path class="cls-2" d="M536.91,472.85v51.71H512.48v-6c0-34.38,0-68.77-.08-103.15,0-3.25.88-4.15,4.06-4.05,10.27.32,20.57.1,30.82.66,3.74.2,7.54,1.64,11,3.14,6.41,2.74,9.56,7.9,9.6,14.91,0,5.08-.14,10.18.12,15.25.39,7.6-1.87,13.72-9.22,17.62,1,.74,1.78,1.26,2.52,1.8a14.88,14.88,0,0,1,6.52,12.09c.13,7.18-.18,14.37,0,21.55a148.16,148.16,0,0,0,1.35,15.16c.29,2.13,1.42,4.14,2.1,6.23.51,1.55.93,3.14,1.56,5.29-8.44,0-16,.08-23.63-.12-.9,0-2.31-1.47-2.54-2.48-1-4.07-2-8.21-2.14-12.35-.31-10.38-.12-20.77-.13-31.16C544.45,474.2,542.17,472.26,536.91,472.85Zm.14-18.19c4.75.54,7.27-1.45,7.36-5.83s.1-8.81,0-13.22-2.75-6.26-7.36-5.57Z" transform="translate(-205.12 -156.33)"/><path class="cls-2" d="M205.2,524.4v-6.12c0-34.36,0-68.72-.08-103.08,0-3.12.9-4,3.89-3.87,10.16.28,20.35-.1,30.46.67,4.43.33,8.93,2.35,13,4.43,6.06,3.14,8.47,8.93,8.5,15.49.12,24.08.18,48.17,0,72.26-.07,10.91-7.56,19-19.95,20C229.27,525.16,217.4,524.4,205.2,524.4Zm24.62-94.61v76.57c4.72.31,6.66-1.46,6.67-6.05q0-32.12,0-64.24C236.49,431.43,235,430,229.82,429.79Z" transform="translate(-205.12 -156.33)"/><path class="cls-2" d="M479.21,411.54h24.45v3.62c0,29.95-.06,59.91,0,89.86,0,8.08-3.46,13.92-10.77,17.07-12.69,5.47-25.4,5.13-37.77-1.14A14.13,14.13,0,0,1,447,507.78q-.18-47.25-.15-94.5a10.86,10.86,0,0,1,.27-1.69h23.93v4.09q0,42.76,0,85.55c0,2.52.25,4.69,3.26,5.25,3.19.59,4.89-1,4.89-4.74q0-43.11,0-86.22Z" transform="translate(-205.12 -156.33)"/><path class="cls-2" d="M270,410.82c13.23.59,26.12.32,38.75,2,10.12,1.35,17.15,7.15,16.41,20.24-.29,5.18,0,10.39-.06,15.58,0,1.74,0,3.77-.89,5.15-2.1,3.37-4.68,6.45-7.21,9.83a14.94,14.94,0,0,1,7.85,11.21c.47,3.26.18,6.62.32,9.92.39,9.7.71,19.4,1.34,29.07.13,2.1,1.48,4.1,2.15,6.18.47,1.47.74,3,1.22,5-8.32,0-15.92.13-23.5-.16-1,0-2.62-2.09-2.83-3.39a148.56,148.56,0,0,1-2.17-18c-.31-8.05.05-16.13.13-24.2.05-5.05-2.05-7-7.49-6.42v51.71H270Zm24.17,43.84a5.74,5.74,0,0,0,7.38-5.89c-.25-4.18,0-8.39-.06-12.58-.06-4.86-1.86-6.44-7.32-6.35Z" transform="translate(-205.12 -156.33)"/><path class="cls-2" d="M383.78,410.86c12.67.56,24.89,1,37.09,1.73,2.43.15,4.85,1.43,7.14,2.47,6.24,2.86,9.37,7.91,9.53,14.69.17,7,.23,13.93.09,20.88-.11,5.89-3.27,10.12-8.51,13.21l3.26,2.25A13,13,0,0,1,438.3,477c.12,9.39.21,18.78,0,28.17-.19,9.58-6.75,17.48-17.41,18.64-12.22,1.33-24.62.91-37.13,1.26Zm24.34,95.47c4.29.31,6.49-1.27,6.57-5.15q.24-12.06,0-24.12c-.08-3.89-2.36-5.44-6.56-4.87Zm0-76.49v25.57c4.62,0,6.45-1.5,6.57-5.71q.19-7.11,0-14.23C414.61,431.33,412.82,429.86,408.16,429.84Z" transform="translate(-205.12 -156.33)"/><path d="M475.46,350.48q34.16,0,68.3,0a49.38,49.38,0,0,1,7.59.5c6.11,1,10.56,4.15,11.78,10.47s-.8,12.17-6.44,15.51c-4,2.35-8.71,4.43-13.2,4.65-15.22.73-30.48.69-45.73.74-26.08.07-52.17.09-78.25-.13a94.49,94.49,0,0,1-18.06-1.91c-7.89-1.62-13-7.44-13.65-14.37-.82-8.25,5.57-14.91,15-15.36,5.52-.26,11.05-.12,16.58-.12Z" transform="translate(-205.12 -156.33)"/><path class="cls-2" d="M631.16,454H609.25c0-6.78-.07-13.38,0-20,0-2.71-.48-4.59-3.69-4.58s-3.7,2-3.7,4.63q.06,34,0,68c0,3.61,2.17,5.42,5.13,4.18a3.72,3.72,0,0,0,2.07-2.52c.22-4.41.12-8.84.1-13.26,0-.86-.11-1.72-.19-2.77l-4.59-.41V467H631v57.79c-3.39,0-6.89.13-10.36-.1-.78,0-1.58-1.28-2.18-2.11a40.72,40.72,0,0,1-2-3.56c-1.12.8-2,1.45-2.87,2.06-9.18,6.22-18.61,6.21-28.16,1a13.89,13.89,0,0,1-7.48-12.83q-.12-39.8,0-79.6c0-8,4.75-14.37,12.59-16.87a46.42,46.42,0,0,1,28.39-.21c8.23,2.55,12.2,8.22,12.23,16.85C631.19,437.5,631.16,445.65,631.16,454Z" transform="translate(-205.12 -156.33)"/><path class="cls-2" d="M640,524.56V518c0-34.26,0-68.51-.08-102.76,0-3.13.94-3.9,3.93-3.87,13.26.14,26.52.06,39.78.06h3.53v18.14H664.6V455h20.18v17.42H664.67v34.22h22.69v17.95Z" transform="translate(-205.12 -156.33)"/><path d="M440,310.29q-15.72,0-31.43,0a39.38,39.38,0,0,0-6,.37c-2.34.36-4.87,1.05-4.83,4s2.58,3.81,5.09,4.19a27.73,27.73,0,0,0,4,.21q68.82,0,137.63-.12a14.76,14.76,0,0,0,6.73-2,2.35,2.35,0,0,0,0-4.32,18.22,18.22,0,0,0-7.66-2.25c-15.69-.2-31.39-.1-47.09-.1h-3.24l-.17-.82c7.76-2,14.49-7,23-6.86,10.16.19,20.34-.15,30.5.25A23.54,23.54,0,0,1,557,305.8c7.06,4,7.29,12.32.92,17.3-4,3.11-8.6,3.78-13.45,3.77H442.29c-12.27,0-24.55.23-36.8-.16a26.22,26.22,0,0,1-11.92-3.13c-7.92-4.61-7.23-14.45,1.08-18.39a25.62,25.62,0,0,1,9.55-2.32c7.84-.36,15.69-.19,23.54-.2a5.19,5.19,0,0,1,2.56.46c3.37,2.06,6.65,4.25,10,6.39Z" transform="translate(-205.12 -156.33)"/><path d="M532,296.91c-13.24-2.44-28.66,1.79-43.75,8.46-7.56,3.34-15.48,5.88-23.17,8.94a8.05,8.05,0,0,1-8.11-.86q-11.6-7.68-23.41-15.06a9.92,9.92,0,0,0-4.89-1.42c-11.27-.12-22.55-.06-33.82-.07-1,0-2.28.32-2.92-.18-1.42-1.11-3.31-2.55-3.47-4-.12-1.09,2.17-3.51,3.42-3.53,14.24-.25,28.5-.18,42.75-.07,1.08,0,2.21.93,3.22,1.58,7.17,4.57,14.36,9.11,21.44,13.83a5.81,5.81,0,0,0,6.05.73c13.26-5.18,26.59-10.2,39.93-15.16a18.38,18.38,0,0,1,6.09-1.16c15.36-.09,30.72-.05,46.08,0,4.54,0,6.77,1.38,6.73,4.09s-2.24,3.94-6.85,3.94Z" transform="translate(-205.12 -156.33)"/><path d="M471.13,243c0,2.67-1.88,4-5.16,4.4-9,1.16-18,1.87-26.77,4-10.65,2.57-20.15,7.78-27.51,16.29-2,2.35-4.74,2.53-6.69.75s-2-4.36.06-6.79c6.94-8.09,15.81-13.33,25.66-17a98.92,98.92,0,0,1,34.73-6.1C469.13,238.41,471.18,240.09,471.13,243Z" transform="translate(-205.12 -156.33)"/><path class="cls-2" d="M356.91,504.88v19.59H337.19V504.88Z" transform="translate(-205.12 -156.33)"/><path d="M546.15,562.61c-3.78-.27-4.81-1.92-4.79-4.31s1.14-4.32,3.84-4.52c2.18-.17,4.74,2.56,4.11,5C548.89,560.45,547,561.7,546.15,562.61Z" transform="translate(-205.12 -156.33)"/><path d="M516.14,562.49c-.38,2.08-.42,4.27-1.25,6.12a4.61,4.61,0,0,1-3.36,2.43c-1.19,0-3.31-1.43-3.39-2.37a67.82,67.82,0,0,1,0-12.34c.09-1,2.17-2.43,3.33-2.43a4.69,4.69,0,0,1,3.39,2.45C515.72,558.2,515.76,560.4,516.14,562.49Z" transform="translate(-205.12 -156.33)"/><path d="M591.72,347.94a6.44,6.44,0,0,1-6.48-6.51,6.54,6.54,0,1,1,13.07.08A6.49,6.49,0,0,1,591.72,347.94Z" transform="translate(-205.12 -156.33)"/></svg>
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
    getReporteProveedor
}
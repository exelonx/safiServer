const { request, response } = require('express');
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');
const base64 = require('node-base64-image');

const ViewUsuario = require (`../../models/seguridad/sql-vistas/view_usuario`);
const Parametro = require('../../models/seguridad/parametro');

const { compilarTemplate } = require('../../helpers/compilarTemplate');
const { eventBitacora } = require('../../helpers/event-bitacora');

const getReporteUsuario = async (req = request, res = response) => {

    let { buscar = "", mostrarInactivos = false, id_usuario} = req.body

    try {

        if(!buscar) {
            buscar = ""
        }

        console.log(mostrarInactivos)
        console.log(buscar)
        const buscador = await puppeteer.launch({headless: true});
        const pagina = await buscador.newPage();

        const usuarios = await ViewUsuario.findAll({
            where: {
                // WHERE PREGUNTA LIKE %${BUSCAR}% OR LIKE %${BUSCAR}%
                [Op.or]: [{
                    USUARIO: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    NOMBRE_USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    ESTADO_USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    ROL: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CORREO_ELECTRONICO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }],
                [Op.not]: [{
                    // Si se recibe true mostrara los inactivos
                    ESTADO_USUARIO: `${mostrarInactivos === false ? 'INACTIVO' : ''}` 
                }]
            }
        })

        
        const usuarioMapped = usuarios.map(( usuarios )=> {
            return {
                USUARIO: usuarios.USUARIO,
                NOMBRE_USUARIO: usuarios.NOMBRE_USUARIO,
                ESTADO_USUARIO: usuarios.ESTADO_USUARIO,
                CONTRASENA: usuarios.CONTRASENA,
                ROL: usuarios.ROL,
                FECHA_ULTIMA_CONEXION: usuarios.FECHA_ULTIMA_CONEXION,
                PREGUNTAS_CONTESTADAS: usuarios.PREGUNTAS_CONTESTADAS,
                PRIMER_INGRESO: usuarios.PRIMER_INGRESO,
                INTENTOS: usuarios.INTENTOS,
                FECHA_VENCIMIENTO: usuarios.FECHA_VENCIMIENTO,
                CORREO_ELECTRONICO: usuarios.CORREO_ELECTRONICO,
                CREADO_POR: usuarios.CREADO_POR,
                FECHA_CREACION: usuarios.FECHA_CREACION,
                MODIFICADO_POR: usuarios.MODIFICADO_POR,
                FECHA_MODIFICACION: usuarios.FECHA_MODIFICACION
            }
        })

        const content = await compilarTemplate('usuario', {usuarios: usuarioMapped})
    
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

        eventBitacora(new Date, id_usuario, 2, 'REPORTE', `SE GENERÓ UN REPORTE DE USUARIOS`);

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
    getReporteUsuario
}
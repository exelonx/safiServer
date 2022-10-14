const { request, response } = require('express');
const puppeteer = require('puppeteer');

// Llamar todas los parametros
const getReporte = async (req = request, res = response) => {
    let { tabla } = req.body

    try {

        const buscador = await puppeteer.launch();
        const pagina = await buscador.newPage();

        await pagina.setContent(`<h1>hola</h1>`);
        await pagina.emulateMediaType('screen')
        await pagina.pdf({
            path: './src/server/reports/pdf.pdf',
            format: 'A4',
            printBackground: true
        })

        await buscador.close()
        console.log('descargar')
        res.sendFile(`${__dirname}../../../reports/pdf.pdf`)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getReporte
}
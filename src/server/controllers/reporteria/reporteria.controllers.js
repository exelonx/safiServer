const { request, response } = require('express');
const puppeteer = require('puppeteer');

// Llamar todas los parametros
const getReporte = async (req = request, res = response) => {
    let { tabla } = req.body

    try {

        try {
            const buscador = await puppeteer.launch();
            const pagina = await buscador.newPage();
    
            await pagina.setContent('<h1>Hola Mundo</h1>');
            await pagina.emulateMediaType('screen')
            await pagina.pdf({
                path: 'mypdf.pdf',
                format: 'A4',
                printBackground: true
            })
    
            console.log('listo')
            await buscador.close()
            process.exit();
        } catch (error) {
            console.log('oh error ', e)
        }

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
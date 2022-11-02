const { request, response } = require('express');
const puppeteer = require('puppeteer');

// Llamar todas los parametros
const getReporte = async (req = request, res = response) => {
    let { tabla } = req.body

    try {

        const buscador = await puppeteer.launch({headless: true});
        const pagina = await buscador.newPage();

        await pagina.goto('https://www.google.com/search?q=henry+cavill&tbm=isch&ved=2ahUKEwjgt9yosIz7AhUPDd8KHWQVADMQ2-cCegQIABAA&oq=henry+cavill&gs_lcp=CgNpbWcQAzIECCMQJzILCAAQgAQQsQMQgwEyBQgAEIAEMgUIABCABDILCAAQgAQQsQMQgwEyBQgAEIAEMgcIABCABBADMggIABCABBCxAzIFCAAQgAQyBQgAEIAEULESWMEUYMMZaABwAHgAgAGiAYgB2AKSAQMyLjGYAQCgAQGqAQtnd3Mtd2l6LWltZ8ABAQ&sclient=img&ei=sr9gY-CWNY-a_AbkqoCYAw&bih=961&biw=1920');

        const pdf = await pagina.pdf({
            format: 'A4',

            margin: {
                top: '100px',
                bottom: '100px'
            },
            displayHeaderFooter: true,
            printBackground: true,
            headerTemplate: `<p style="font-size:10px; margin: 0 auto;"><span class="pageNumber"></span> of <span class="totalPages"></span></p>`
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
    getReporte
}

const fs = require('fs');
const hbs = require('handlebars');
const path = require('path')

const compilarTemplate = async (nombreTemplate, datos) => {
    
    const pathArchivo = path.join(process.cwd(), 'src/server/templates/reports', `${nombreTemplate}.handlebars`);

    const html = await fs.readFileSync(pathArchivo, 'utf-8');

    hbs.registerHelper("inc", function(value, options)
    {
        return parseInt(value) + 1;
    });

    return hbs.compile(html)(datos)
}

module.exports = {
    compilarTemplate
}

const path = require('path')

const cargarOpcionesHBS = () => {

    return {
        viewEngine: {
            extName: '.handlebars',
            partialsDir: path.resolve('./src/server/templates/mail/'),
            defaultLayout: false
        },
        viewPath: path.resolve('./src/server/templates/mail/'),
        extName: ".handlebars"
    }

}

module.exports = {
    cargarOpcionesHBS
}
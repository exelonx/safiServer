// Función que retornara la instancia ya existente del servidor
// en forma singlenton
const instanciarServidor = () => {
    const Server = require('../models/server');
    return Server.getInstance();
}

module.exports = {
    instanciarServidor
}
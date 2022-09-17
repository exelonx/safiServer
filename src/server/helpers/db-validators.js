const Usuario = require('../models/seguridad/usuario');

const emailExistente = async(CORREO_ELECTRONICO = '') => {
    const emailExiste = await Usuario.findOne({CORREO_ELECTRONICO});
    if (!emailExiste){
        throw new Error(`El correo: ${CORREO_ELECTRONICO}, ya esta registrado`)
    }
};

module.exports = {
    emailExistente,
}
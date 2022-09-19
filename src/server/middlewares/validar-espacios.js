const { response, request } = require("express");

const validarEspaciosLogin = (req = request, res = response, next) => {

    const { usuario = "", contrasena = "" } = req.body;

    // Validar que no exista espacio en blanco
    if ( usuario.includes(' ') || contrasena.includes(' ') ) {
        return res.status(400).json({
            ok: false,
            msg: 'No se permite espacios en el usuario/contraseña.'
        })
    }

    //TODO OK!
    next();

}

const validarEspacio = async( campo = '' ) => {
    // Validar que no exista espacio en blanco
    if ( campo.includes(' ') ) {
            throw new Error()
    }
};

module.exports = {
    validarEspaciosLogin,
    validarEspacio
}
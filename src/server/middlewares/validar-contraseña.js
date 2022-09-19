const { response, request } = require("express");
const passwordValidator = require('password-validator');

//configuración de validaciones
const esquema = new passwordValidator();
esquema
    .has().min(1).uppercase(1, 'Mínimo un carácter en mayúscula')  // Contener min 1 Mayúscula
    .has().min(1).lowercase(1, 'Mínimo un carácter en minúscula')  // Contener min 1 Minúscula
    .has().min(1).symbols(1, 'Mínimo un carácter especial')    // Contener min 1 symbolo
    .has().min(1).digits(1, 'Mínimo un carácter numérico')     // Contener min 1 número

// Middleware validador
const validarContraseña = (req = request, res = response, next) => {

    // Leer contraseña del body
    const { contrasena } = req.body;

    if ( !esquema.validate( contrasena ) ) {
        const [message] = esquema.validate( contrasena, {details: true} )
        return res.status(400).json({
            ok: false,
            msg: message.message
        })
    }

    //TODO OK!
    next();

}

// Validador para el middleware de parametros
const validarContraseñaParametro = ( valor, res ) => {

    if ( !esquema.validate( valor ) ) {
        const [message] = esquema.validate( valor, {details: true} )
        return message.message;
    }
    
}

module.exports = {
    validarContraseña,
    validarContraseñaParametro
}
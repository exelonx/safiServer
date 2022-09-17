const { response, request } = require("express");
const passwordValidator = require('password-validator');


const validarContraseña = (req = request, res = response, next) => {

    // Leer contraseña del body
    const { contraseña } = req.body;

    //configuración de validaciones
    const esquema = new passwordValidator();
    esquema
        .has().min(1).uppercase(1, 'Mínimo un carácter en mayúscula')  // Contener min 1 Mayúscula
        .has().min(1).lowercase(1, 'Mínimo un carácter en minúscula')  // Contener min 1 Minúscula
        .has().min(1).symbols(1, 'Mínimo un carácter especial')    // Contener min 1 symbolo
        .has().min(1).digits(1, 'Mínimo un carácter numérico')     // Contener min 1 número

    // Validar contraseña con esquema de validaciones
    if ( !esquema.validate( contraseña ) ) {
        const [message] = esquema.validate( contraseña, {details: true} )
        return res.status(400).json({
            ok: false,
            msg: message.message
        })
    }

    //TODO OK!
    next();

}

module.exports = {
    validarContraseña
}
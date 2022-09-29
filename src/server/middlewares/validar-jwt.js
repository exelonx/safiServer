const { response, request } = require("express");
const jwt = require('jsonwebtoken')

// Valida Token de login
const validarJWT = (req, res = response, next) => {

    // Leer token desde el header
    const token = req.header('x-token');

    // Validar existencia
    if ( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'error en el token'
        })
    }

    try {

        // Usa semilla de login
        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_LOGIN );
        req.uid = uid;
        
    } catch (error) {
        // Error de token expirado
        if( error instanceof jwt.TokenExpiredError ) {
            return res.status(401).json({
                ok: false,
                msg: 'Su sesión ha expirado'
            })
        }

        // Token modificado o no válido
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        })
    }

    //TODO OK!
    next();

}

// Validar Token de correo
const validarCorreoJWT = (req = request, res = response, next) => {

    // Leer token desde los params
    const { token } = req.params;

    if ( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'error en el token'
        })
    }

    try {

        // Usa semilla de correo
        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_CORREO );
        req.uid = uid;
        
    } catch (error) {
        // Error de token expirado
        if( error instanceof jwt.TokenExpiredError ) {
            return res.status(401).json({
                ok: false,
                msg: 'Su tiempo ha expirado'
            })
        }

        // Token modificado o no válido
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        })
    }

    //TODO OK!
    next();

}

// Validar Token de correo
const validarPreguntaJWT = (req = request, res = response, next) => {

    // Leer token desde los params
    const { token } = req.params;

    if ( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'error en el token'
        })
    }

    try {

        // Usa semilla de correo
        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_PREGUNTA );
        const algo = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_PREGUNTA );
        console.log(algo)
        req.uid = uid;
        
    } catch (error) {
        // Error de token expirado
        if( error instanceof jwt.TokenExpiredError ) {
            return res.status(401).json({
                ok: false,
                msg: 'Su tiempo ha expirado'
            })
        }

        // Token modificado o no válido
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        })
    }

    //TODO OK!
    next();

}

module.exports = {
    validarJWT,
    validarCorreoJWT,
    validarPreguntaJWT
}
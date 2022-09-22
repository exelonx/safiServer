const { response, request } = require("express");
const jwt = require('jsonwebtoken')

const validarJWT = (req, res = response, next) => {

    const token = req.header('x-token');

    if ( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'error en el token'
        })
    }

    try {

        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_LOGIN );
        req.uid = uid;
        
    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        })
    }

    //TODO OK!
    next();

}

const validarCorreoJWT = (req = request, res = response, next) => {

    const { token } = req.params;

    if ( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'error en el token'
        })
    }

    try {

        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_CORREO );
        req.uid = uid;
        
    } catch (error) {
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
    validarCorreoJWT
}
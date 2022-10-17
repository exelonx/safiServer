const validator = require('validator');
const { response, request } = require("express");

const Parametro = require("../models/seguridad/parametro");

const { validarContraseñaParametro } = require('./validar-contraseña');

const validarCamposYExistenciaParametros = async(req = request, res = response, next) => {

    const { id_parametro } = req.params;
    const { valor } = req.body;

    // Validar que exista la respuesta
    const parametro = await Parametro.findByPk( id_parametro )
    if ( !parametro ) {
        return res.status(400).json({
            ok: false,
            msg: `El parametro con id ${ id_parametro } no existe`
        })
    }

    // Validar que sean números
    if ( parametro.PARAMETRO == 'ADMIN_CPUERTO' || parametro.PARAMETRO == 'ADMIN_DIAS_VIGENCIA' 
         || parametro.PARAMETRO == 'MAX_CONTRASENA' || parametro.PARAMETRO == 'MIN_CONTRASENA'
         || parametro.PARAMETRO == 'ADMIN_INTENTOS' || parametro.PARAMETRO == 'ADMIN_PREGUNTAS') {
        if (!validator.isNumeric(valor)) {
            return res.status(400).json({
                ok: false,
                msg: 'Este parametro debe ser númerico'
            })
        }
    }

    // Validar que la máximo de contraseña no sea inferior al mínimo
    if ( parametro.PARAMETRO == 'MAX_CONTRASENA') {
        const minContraseña = await Parametro.findOne({ where: {PARAMETRO: 'MIN_CONTRASEÑA'}})
        if ( valor <= minContraseña.VALOR ) {
            return res.status(400).json({
                ok: false,
                msg: 'Debe ingresar un valor mayor a la contraseña mínima'
            })
        }   
    }

    // Validar que el mínimo de la contraseña no sea superior al máximo
    if ( parametro.PARAMETRO == 'MIN_CONTRASENA') {
        const maxContraseña = await Parametro.findOne({ where: {PARAMETRO: 'MAX_CONTRASEÑA'}})
        if ( valor >= maxContraseña.VALOR ) {
            return res.status(400).json({
                ok: false,
                msg: 'Debe ingresar un valor menor a la contraseña máxima'
            })
        }

        // Validar que sea mayor a 0
        if ( valor < 5 ) {
            return res.status(400).json({
                ok: false,
                msg: 'Debe ingresar un valor mayor a 4'
            })
        }
    }

    // Validar que sea un correo válido
    if ( parametro.PARAMETRO == 'ADMIN_CORREO' ) {
        if(!validator.isEmail(valor)) {
            return res.status(400).json({
                ok: false,
                msg: 'Debe ser un correo válido'
            })
        }
    }

    // Validar contraseña
    if ( parametro.PARAMETRO == 'ADMIN_CPASS') {
        const error = validarContraseñaParametro( valor, res );
        if ( error ) {
            return res.status(400).json({
                ok: false,
                msg: error
            })
        }
    }

    // Validar Mayúsculas
    if ( parametro.PARAMETRO == 'ADMIN_CUSER' || parametro.PARAMETRO == 'SYS_NOMBRE' ) {
        if (!validator.isUppercase(valor)) {
            return res.status(400).json({
                ok: false,
                msg: 'Este parametro debe estar en mayúscula'
            })
        }
    }

    // Validar números de intentos y preguntas
    if ( parametro.PARAMETRO == 'ADMIN_INTENTOS' || parametro.PARAMETRO == 'ADMIN_PREGUNTAS' ) {
        if ( valor < 1 ) {
            return res.status(400).json({
                ok: false,
                msg: 'Este parametro debe ser mayor a 0'
            })
        }
    }

    //TODO OK!
    next();

}

module.exports = {
    validarCamposYExistenciaParametros
}
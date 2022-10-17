const { response, request } = require("express");
const { Op } = require("sequelize");

const Usuario = require("../models/seguridad/Usuario");

const existeEmail = async( req = request, res = response, next ) => {

    const { correo } = req.body;

    // Verificar el email
    let user = await Usuario.findOne({ where: { CORREO_ELECTRONICO: correo } });
    if ( user ) {

        return res.status(400).json({
            ok: false,
            msg: 'Ya está registrado este correo'
        })
    }

    next()
}

const existeUsuario = async( req = request, res = response, next ) => {

    const { usuario = "" } = req.body;

    // Verificar el usuario
    let user = await Usuario.findOne({ where: { USUARIO: usuario } });

    if ( user ) {
        return res.status(400).json({
            ok: false,
            msg: 'Ya está registrado este usuario'
        })
    }

    next()
}

const existeUsuarioUpdated = async( req = request, res = response, next ) => {

    const { id_usuario } = req.params;
    const { usuario = "" } = req.body;

    // Verificar el usuario
    let user = await Usuario.findOne({
        where: {    //Where ROL = rol and NOT ID_ROL = id_rol
            USUARIO: usuario,
            [Op.not] : [
                {ID_USUARIO: id_usuario}
            ]       
        }
    });

    if ( user ) {
        return res.status(400).json({
            ok: false,
            msg: 'Ya está registrado este usuario'
        })
    }

    next()
}

const noExisteUsuario = async( req = request, res = response, next ) => {

    const { id_usuario } = req.body;

    // Verificar el usuario
    let user = await Usuario.findByPk( id_usuario );

    if ( !user ) {
        return res.status(400).json({
            ok: false,
            msg: 'No existe un usuario con el ID: '+id_usuario
        })
    }

    next()
}

const validarEspaciosUsuario = async (nombre_usuario = '') => {

    if ( nombre_usuario.includes('  ') ) {
        throw new Error()
    }

}

const validarContrasenaActual = async( req = request, res = response, next ) => {

    const { id_usuario } = req.params;
    const { confirmContrasenaActual } = req.body;

    // Verificar el usuario
    let user = await Usuario.findByPk( id_usuario );

    // Confirmar si el contraseña hace match
    const validarContrasena = await bcrypt.compareSync( confirmContrasenaActual, user.CONTRASENA )
    if( !validarContrasena ) {

        eventBitacora(new Date, id_usuario, 13, 'ACTUALIZACION', 'INTENTO DE CAMBIO DE CONTRASEÑA SIN ÉXITO');

        return res.status(404).json({
            ok: false,
            msg: 'Contraseña incorrecta'
        });
    }

    next()
}

module.exports = {
    validarContrasenaActual,
    existeEmail,
    existeUsuario,
    existeUsuarioUpdated,
    noExisteUsuario,
    validarEspaciosUsuario
}

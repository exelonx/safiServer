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

module.exports = {
    existeEmail,
    existeUsuario,
    existeUsuarioUpdated,
    noExisteUsuario
}

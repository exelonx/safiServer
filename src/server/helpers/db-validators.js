const { response, request } = require("express");
const { Op } = require("sequelize");
const Usuario = require('../models/seguridad/usuario');

const emailExistente = async(CORREO_ELECTRONICO = '') => {
    const emailExiste = await Usuario.findOne({where:{CORREO_ELECTRONICO}});
    if (emailExiste){
        throw new Error(`El correo: ${CORREO_ELECTRONICO}, ya esta registrado`)
    }
};

const emailExistenteUpdate = async(req = request, res = response, next) => {

    const { id_usuario } = req.params;
    const { correo = "" } = req.body;

    const existenciaCorreo = await Usuario.findOne({
        where: {    //Where ROL = rol and NOT ID_ROL = id_rol
            CORREO_ELECTRONICO: correo,
            [Op.not] : [
                {ID_USUARIO: id_usuario}
            ]       
        }
    });

    // Validar que no exista otro rol con el mismo nombre
    if ( existenciaCorreo ) {
        return res.status(400).json({
            ok: false,
            msg: `El correo: ${correo}, ya esta registrado`
        })
    }

    //TODO OK!
    next();

}

/**
 * Validar colecciones permitidas
 */

const coleccionesPermitidas = (coleccion = '', colecciones = []) => {
    const incluida = colecciones.includes(coleccion);
    if(!incluida){
        throw new Error(`La coleccion ${coleccion} no es permitida, ${colecciones}`);
    }

    return true;
}


module.exports = {
    emailExistente,
    emailExistenteUpdate,
    coleccionesPermitidas
}
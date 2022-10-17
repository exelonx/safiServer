const { response, request } = require("express");
const { Op } = require("sequelize");

const Roles = require("../models/seguridad/rol");

const existenciaRolParaPut = async(req = request, res = response, next) => {

    const { id_rol } = req.params;
    const { rol = "" } = req.body;

    const existenciaRol = await Roles.findOne({
        where: {    //Where ROL = rol and NOT ID_ROL = id_rol
            ROL: rol,
            [Op.not] : [
                {ID_ROL: id_rol}
            ]       
        }
    });

    // Validar que no exista otro rol con el mismo nombre
    if ( existenciaRol ) {
        return res.status(400).json({
            ok: false,
            msg: 'Ya existe un rol con el nombre de: ' + rol
        })
    }

    //TODO OK!
    next();

}

module.exports = {
    existenciaRolParaPut
}
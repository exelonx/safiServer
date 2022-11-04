const { request, response } = require('express');
const { Op } = require('sequelize');


const Objeto = require('../../models/seguridad/objeto');

const Usuarios = require('../../models/seguridad/usuario');

const { eventBitacora } = require('../../helpers/event-bitacora');
const Parametro = require('../../models/seguridad/parametro');

// Llamar todas los parametros
const getCatalogo = async (req = request, res = response) => {

    let {nombre} = req.body;
    try {

        const parametro = await Parametro.findAll(
            {where: {
                PARAMETRO: 'ADMIN_INTENTOS'
            }}
        )
        res.json({parametro})

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}


module.exports = {
    getCatalogo
}
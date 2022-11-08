const { request, response } = require('express');
const { Op } = require('sequelize');

const Objeto = require('../../models/seguridad/objeto');

// Llamar todos las pantallas
const getPantallas = async (req = request, res = response) => {

    try {

        // Traer todos las pantallas
        const pantallas = await Objeto.findAll({
            where:{
                [Op.and]: [
                    {TIPO_OBJETO: {
                        [Op.not]: 'AUTH'
                    }},
                    {TIPO_OBJETO: {
                        [Op.not]: 'LOGOUT'
                    }},
                ]
            }
        });

        // Respuesta
        res.json( {pantallas} );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getPantallas
}

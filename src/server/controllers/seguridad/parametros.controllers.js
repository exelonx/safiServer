const { request, response } = require('express');
const { Op } = require('sequelize');

const ViewParametro = require('../../models/seguridad/parametro');

// Llamar todas los parametros
const getParametros = async (req = request, res = response) => {
    
    const { buscar = "" } = req.body;

    try {

        const parametros = await ViewParametro.findAll({
            where: {
                // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
                [Op.or]: [{
                    PARAMETRO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    VALOR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });

        // Respuesta
        res.json( parametros );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo parametro
const getParametro = async (req = request, res = response) => {
     
    const { id_parametro } = req.params

    try {
        
        const parametro = await Parametro.findByPk( id_parametro );

        // Validar Existencia
        if( !parametro ){
            return res.status(404).json({
                msg: 'No existe un parametro con el id ' + id_parametro
            })
        }

        res.json( parametro )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const putParametro = async (req = request, res = response) => {

    const { id_parametro } = req.params
    const { valor, id_usuario } = req.body;

    try {

        // Actualizar db Parametro
        await Parametro.update({
            MODIFICADO_POR: id_usuario,
            VALOR: valor
        }, {
            where: {
                ID_PARAMETRO: id_parametro
            }
        })

        res.json({ id_parametro, valor, id_usuario });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getParametros,
    getParametro,
    putParametro,
}

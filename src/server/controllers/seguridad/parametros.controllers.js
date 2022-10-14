const { request, response } = require('express');
const { Op } = require('sequelize');

const Parametro = require('../../models/seguridad/parametro');
const ViewParametro = require('../../models/seguridad/parametro');

// Llamar todas los parametros
const getParametros = async (req = request, res = response) => {
    let { limite, desde = 0, buscar = "", id_usuario } = req.query

    try {

        // Definir el número de objetos a mostrar
        if(!limite || limite === "") {
            const { VALOR } = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
            limite = VALOR
        }

        if(desde === "") {
            desde = 0
        }

        const parametros = await ViewParametro.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
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

        const countParametro = await ViewParametro.count({where: {
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
        }})

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, id_usuario, 10, 'CONSULTA', `SE BUSCO LOS PARAMETRO CON EL TERMINO ${buscar}`);
        }

        // Respuesta
        res.json( {limite, countParametro, parametros} );

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

        const parametro = await Parametro.findByPk( id_parametro )

        // Actualizar db Parametro
        await Parametro.update({
            MODIFICADO_POR: id_usuario,
            VALOR: valor
        }, {
            where: {
                ID_PARAMETRO: id_parametro
            }
        })

        // Guardar evento
        eventBitacora(new Date, id_usuario, 10, 'ACTUALIZACION', `SE ACTUALIZO EL PARAMETRO: ${parametro.PARAMETRO}`);

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

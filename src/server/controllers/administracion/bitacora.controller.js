const { request, response } = require('express');
const { Op } = require('sequelize');

const ViewBitacora = require('../../models/administracion/sql-vistas/view_bitacora');
const Objeto = require('../../models/seguridad/objeto');
const Parametro = require('../../models/seguridad/parametro');
const Usuarios = require('../../models/seguridad/usuario');

const { eventBitacora } = require('../../helpers/event-bitacora');

// Llamar todas los parametros
const getBitacora = async (req = request, res = response) => {
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

        const registros = await ViewBitacora.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
                [Op.or]: [{
                    USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    OBJETO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    ACCION: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    DESCRIPCION: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });

        // Contar resultados total
        const countBitacora = await ViewBitacora.count({where: {
            // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
            [Op.or]: [{
                USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                OBJETO: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                ACCION: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                DESCRIPCION: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }]
        }})

        // Guardar evento
        if( buscar !== "" && desde == 0 ) {
            eventBitacora(new Date, id_usuario, 11, 'CONSULTA', `SE BUSCO EN LA BITACORA CON EL TERMINO '${buscar}'`);
        }

        // Respuesta
        res.json( {limite, countBitacora, registros} );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const registrarIngreso = async (req = request, res = response) => {

    const { id_usuario, idPantalla } = req.body;

    try {

        console.log('registrando')
        // Traer información del usuario y pantalla
        const usuario = await Usuarios.findByPk(id_usuario);
        const pantalla = await Objeto.findByPk(idPantalla);

        // Registrar ingreso
        eventBitacora(new Date, id_usuario, idPantalla, 'INGRESO', `${usuario.USUARIO} INGRESO A LA PANTALLA '${pantalla.OBJETO}'`);

        res.json({
            ok: true
        })
        
    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })

    }


}

module.exports = {
    getBitacora,
    registrarIngreso
}
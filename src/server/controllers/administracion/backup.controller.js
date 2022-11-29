const { request, response } = require('express');
const { Op } = require('sequelize');

const ViewBitacora = require('../../models/administracion/sql-vistas/view_bitacora');
const Objeto = require('../../models/seguridad/objeto');
const Parametro = require('../../models/seguridad/parametro');
const Usuarios = require('../../models/seguridad/usuario');

const { eventBitacora } = require('../../helpers/event-bitacora');

// Para llamar a una sola caja 
const getDatabase = async (req = request, res = response) => {
     
    // const { id } = req.params

    try {
        
        const esquema = process.env.ESQUEMA;
        const host =  process.env.MYSQL_HOST;
        const user = process.env.SQL_USER;
        const password = process.env.SQL_PASSWORD;
        // const caja = await Caja.findByPk( id );

        // // Validar Existencia
        // if( !caja ){
        //     return res.status(404).json({
        //         msg: 'No existe una caja con el id ' + id
        //     })
        // }

        res.json({ esquema, host, user, password })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getDatabase
}
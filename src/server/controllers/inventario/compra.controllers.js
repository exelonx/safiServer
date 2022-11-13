const { request, response } = require('express');
const { Op } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewCompra = require('../../models/inventario/sql-vista/view-compra');

const getCompras = async (req = request, res = response) => {
    let { limite = 10, desde = 0, buscar = "", quienBusco = "" } = req.query

    try {

        // Definir el número de objetos a mostrar
        if (!limite || limite === "") {
            const { VALOR } = await Parametro.findOne({ where: { PARAMETRO: 'ADMIN_NUM_REGISTROS' } })
            limite = VALOR;
        }

        if (desde === "") {
            desde = 0;
        }

        // Paginación
        const compra = await ViewCompra.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    PROVEEDOR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Contar resultados total
        const countCompra = await ViewCompra.count({
            where: {
                [Op.or]: [{
                    PROVEEDOR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Guardar evento
        if (buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 23, 'CONSULTA', `SE BUSCÓ LA COMPRA CON EL TÉRMINO '${buscar}'`);
        }

        // Respuesta
        res.json({ limite, countCompra, compra })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    } 
}

module.exports = {
    getCompras
}
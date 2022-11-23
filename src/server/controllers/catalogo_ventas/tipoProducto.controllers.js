const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const { eventBitacora } = require('../../helpers/event-bitacora');
const Impuesto = require('../../models/catalogo-ventas/tipo-impuesto');
const ViewImpuesto = require('../../models/catalogo-ventas/sql-vistas/view_tipo-impuesto');
const TipoProducto = require('../../models/catalogo-ventas/tipoProducto');

const getTipoProducto = async (req = request, res = response) => {

    try {

        const tipoProducto = await TipoProducto.findAll();
        res.json({tipoProducto})

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getTipoProducto
}
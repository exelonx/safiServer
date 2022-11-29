const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewPromocionProducto = require('../../models/catalogo-ventas/sql-vistas/view_promocionProducto');

const getPromocionProductos = async (req = request, res = response) => {
    let { limite = 10, desde = 0, buscar = "", id_usuario = "" } = req.query

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
        const promocionProducto = await ViewPromocionProducto.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    NOMBRE_PROMOCION: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    NOMBRE_PRODUCTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Contar resultados total
        const countPromocionProducto = await ViewPromocionProducto.count({
            where: {
                [Op.or]: [{
                    NOMBRE_PROMOCION: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    NOMBRE_PRODUCTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Guardar evento
        // if (buscar !== "" && desde == 0) {
        //     eventBitacora(new Date, id_usuario, 23, 'CONSULTA', `SE BUSCÓ LA COMPRA CON EL TÉRMINO '${buscar}'`);
        // }

        // Respuesta
        res.json({ limite, countPromocionProducto, promocionProducto })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    } 
}

const getPromocionProducto = async (req = request, res = response) => {
    
    const { id } = req.params
    
    try {
        const promocionProducto = await ViewPromocionProducto.findByPk( id );

        // Validar Existencia
        if( !promocionProducto ){
            return res.status(404).json({
                msg: 'No existe una promocion con el id ' + id
            })
        }

        res.json({ descuento })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getPromocionProductos,
    getPromocionProducto
}
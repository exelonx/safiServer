const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewInsumoProducto = require('../../models/inventario/sql-vista/view_insumoProducto');

const getInsumoProductos = async (req = request, res = response) => {
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
        const insumoProducto = await ViewInsumoProducto.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    NOMBRE_INSUMO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    NOMBRE_PRODUCTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Contar resultados total
        const countInsumoProducto = await ViewInsumoProducto.count({
            where: {
                [Op.or]: [{
                    NOMBRE_INSUMO: { [Op.like]: `%${buscar.toUpperCase()}%` }
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
        res.json({ limite, countInsumoProducto, insumoProducto })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    } 
}

const getInsumoProducto = async (req = request, res = response) => {
    
    const { id } = req.params
    
    try {
        const insumoProducto = await ViewInsumoProducto.findByPk( id );

        // Validar Existencia
        if( !insumoProducto ){
            return res.status(404).json({
                msg: 'No existe un insumo de producto con el id ' + id
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

const getInsumosProducto = async (req = request, res = response) => {
    
    const { id_producto } = req.params
    
    try {
        const insumoProducto = await ViewInsumoProducto.findAll({
            where: {
                ID_PRODUCTO: id_producto
            }
        });

        // Validar Existencia
        if( !insumoProducto ){
            return res.status(404).json({
                msg: 'No existe un insumo de producto con el id ' + id
            })
        }

        res.json({ insumoProducto })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getInsumoProductos,
    getInsumoProducto,
    getInsumosProducto
}
const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewComboProducto = require('../../models/catalogo-ventas/sql-vistas/view_comboProducto');

const getComboProductos = async (req = request, res = response) => {
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
        const comboProducto = await ViewComboProducto.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    NOMBRE_COMBO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    NOMBRE_PRODUCTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Contar resultados total
        const countComboProducto = await ViewComboProducto.count({
            where: {
                [Op.or]: [{
                    NOMBRE_COMBO: { [Op.like]: `%${buscar.toUpperCase()}%` }
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
        res.json({ limite, countComboProducto, comboProducto })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    } 
}

const getComboProducto = async (req = request, res = response) => {
    
    const { id_combo } = req.params
    
    try {
        const comboProducto = await ViewComboProducto.findAll({
            where:{
                ID_COMBO: id_combo
            }
        });

        // Validar Existencia
        if( !comboProducto ){
            return res.status(404).json({
                msg: 'No existe un combo con el id ' + id
            })
        }

        res.json({ comboProducto })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getComboProductos,
    getComboProducto
}
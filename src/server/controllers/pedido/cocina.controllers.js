const { Op } = require("sequelize");
const ViewDetallePedido = require("../../models/pedido/sql-vista/view_detalle");
const Parametro = require("../../models/seguridad/parametro");

const getDetallesCocina = async (req = request, res = response) => {

    let { limite, desde = 0, buscar = "", quienBusco = "" } = req.query

    try {

        // Definir el número de objetos a mostrar
        if (!limite || limite === "") {
            const { VALOR } = await Parametro.findOne({ where: { PARAMETRO: 'ADMIN_NUM_REGISTROS' } })
            limite = VALOR;
        }

        if (desde === "") {
            desde = 0;
        }

        const detalles = await ViewDetallePedido.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.not]: [
                    {
                        [Op.or]: [{
                            ID_ESTADO: 3
                        }, {
                            ID_ESTADO: 4
                        }, {
                            ID_ESTADO: 5
                        }, {
                            ID_ESTADO: 6
                        }]
                    }
                ],
                [Op.or]: [{
                    MESA: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    NOMBRE_PRODUCTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    ESTADO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Contar resultados total
        const countDetalles = await ViewDetallePedido.count({
            where: {
                [Op.or]: [{
                    MESA: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    NOMBRE_PRODUCTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    ESTADO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        res.json({ limite, countDetalles, detalles })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

module.exports = {
    getDetallesCocina
}
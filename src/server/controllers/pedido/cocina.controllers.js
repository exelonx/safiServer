const ViewDetallePedido = require("../../models/pedido/sql-vista/view_detalle");

const getDetallesCocina = async (req = request, res = response) => {
    try {
        
        const detalles = await ViewDetallePedido.findAll({
            where: { 
                [Op.not]: [
                    {[Op.or]: [{
                        ID_ESTADO: 3
                    },{
                        ID_ESTADO: 4
                    },{
                        ID_ESTADO: 5
                    },{
                        ID_ESTADO: 6
                    }]}
                ]
            } 
        });

        res.json({detalles})

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
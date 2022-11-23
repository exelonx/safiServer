const { request, response } = require('express');
const { Op } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewKardex = require('../../models/inventario/sql-vista/view_kardex');
const ViewInsumo = require('../../models/inventario/sql-vista/view-insumo');

const getKardex = async (req = request, res = response) => {
    let { limite, desde = 0, buscar = "", id_usuario, fechaInicial ="", fechaFinal="", id_insumo = 0 } = req.query
    let filtrarPorFecha = {}
    let filtrarInsumo = {}
    try {

        // Definir el número de objetos a mostrar
        if(!limite || limite === "") {
            const { VALOR } = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
            limite = VALOR
        }

        if(desde === "") {
            desde = 0
        }

        // Validar si llegaron fechas
        if( fechaFinal !== '' && fechaInicial !== '') {
            filtrarPorFecha = { 
                FECHA_Y_HORA: {
                    [Op.between]: [new Date(fechaInicial), new Date(fechaFinal)]
                }
            }
        }

        if( id_insumo != 0) {
            filtrarInsumo = {ID_INSUMO: id_insumo}
        }

        console.log(filtrarInsumo)

        const registros = await ViewKardex.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
                [Op.or]: [{
                    USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    TIPO_MOVIMIENTO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }],
                [Op.and]: [filtrarPorFecha, filtrarInsumo]
            }
        });

        // Contar resultados total
        const countKardex = await ViewKardex.count({where: {
            // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
            [Op.or]: [{
                USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                TIPO_MOVIMIENTO: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }],
            [Op.and]: [filtrarPorFecha, filtrarInsumo]
        }})

        // Guardar evento
        if( buscar !== "" && desde == 0 ) {
            eventBitacora(new Date, id_usuario, 22, 'CONSULTA', `SE BUSCÓ EN EL KARDEX CON EL TERMINO '${buscar}'`);
        }

        // Respuesta
        return res.json( {limite, countKardex, registros} );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    } 
}

const validarIdInsumoKardex = async (req = request, res = response) => {
    const {id_insumo = 0} = req.params;
    
    try {
        
        // Instanciar el insumo
        const insumo = await ViewInsumo.findByPk(id_insumo);

        if(insumo || id_insumo == 0) {
            return res.json(true)
        } else {
            return res.json(false)
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }

}

const getNombreInsumo = async (req = request, res = response) => {
    const {id_insumo} = req.params;

    try {
        
        // Instanciar el insumo
        const insumo = await ViewInsumo.findByPk(id_insumo);

        return res.json( {insumo} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

module.exports = {
    getKardex,
    validarIdInsumoKardex,
    getNombreInsumo
}
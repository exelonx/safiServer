const { request, response } = require('express');
const { Op } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewCompra = require('../../models/inventario/sql-vista/view-compra');
const Compra = require('../../models/inventario/compra');
const CompraDetalle = require('../../models/inventario/detalle-compra');
const Inventario = require('../../models/inventario/inventario');
const ViewInsumo = require('../../models/inventario/sql-vista/view-insumo');
const { instanciarServidor } = require('../../helpers/instanciarServer');
const { notificar } = require('../../helpers/notificar');

const getCompras = async (req = request, res = response) => {
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
        const compras = await ViewCompra.findAll({
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
            eventBitacora(new Date, id_usuario, 23, 'CONSULTA', `SE BUSCÓ LA COMPRA CON EL TÉRMINO '${buscar}'`);
        }

        // Respuesta
        res.json({ limite, countCompra, compras })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    } 
}

const getCompra = async (req = request, res = response) => {
    const { id_compra=0 } = req.params
    try {
        const compra = await ViewCompra.findByPk(id_compra);
        const detalle = await CompraDetalle.findAll({where: {ID_COMPRA: id_compra}})

        const detalleCompra = await detalle.map((insumo) => {
            return {
                id: insumo.id,
                ID_COMPRA: insumo.ID_COMPRA,
                ID_INSUMO: insumo.ID_INSUMO,
                CANTIDAD: insumo.CANTIDAD,
                PRECIO_COMPRA: insumo.PRECIO_COMPRA,
                editar: false       // Para permitir editar desde el formulario
            }
        })

        return res.json({
            ok: true,
            compra,
            detalleCompra
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const postCompra = async (req = request, res = response) => {
    const { arregloDetalle = "", id_usuario = "", id_proveedor = "", total = "" } = req.body
    let error = false;    // Para evitar crasheo del servidor
    let indice = 0;
    let detalleMapped = ""
    try {

        // Validar que el arreglo sea valido
        for (let i = 0; i < arregloDetalle.length; i++) {
            const insumo = arregloDetalle[i];

            if(!(insumo.insumo && insumo.cantidad && insumo.precio)){
                // Respuesta
                error = true
                indice = i;
                break
            }
        }

        // Lanzar error
        if( error ) {
            return res.status(400).json({
                ok: false,
                msg: 'Se esperaba un arreglo de insumos válido, error en el índice: '+indice
            });
        }

        // Crear compra
        const compra = await Compra.create({
            ID_PROVEEDOR: id_proveedor,
            TOTAL_PAGADO: total,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        })

        // Mapear el detalle para que lo acepte la tabla
        detalleMapped = await arregloDetalle.map( detalle => {
            return {
                ID_INSUMO: detalle.insumo,
                CANTIDAD: detalle.cantidad,
                PRECIO_COMPRA: detalle.precio,
                ID_COMPRA: compra.id
            }
        } );

        // Insertar detalle
        await CompraDetalle.bulkCreate(detalleMapped);

        // Responder
        res.json({
            ok:true,
            msg: 'Ingreso de compra con éxito'
        })

        // =================================== NOTIFICAR ===================================
        
        for await (detalle of detalleMapped) {

            // Traer insumo
            const insumo = await ViewInsumo.findByPk(detalle.ID_INSUMO)

            // Registrar en bitacora
            eventBitacora(new Date, id_usuario, 23, 'NUEVO', `SE REALIZÓ UNA NUEVA COMPRA DE ${detalle.CANTIDAD} ${insumo.UNIDAD_MEDIDA} DE ${insumo.NOMBRE}`);

            // Verificar si la compra del insumo esta en limites correctos
            if( insumo.CANTIDAD_MAXIMA < insumo.EXISTENCIA) {   // Por encima del limite
                
                // Notificar a los usuarios
                await notificar(1, `Exceso de ${insumo.NOMBRE.toLowerCase()}`, `Existencia de ${insumo.NOMBRE.toLowerCase()} esta por encima de la cantidad máxima. Cantidad Máxima: ${insumo.CANTIDAD_MAXIMA} ${insumo.UNIDAD_MEDIDA}, Existencia actual: ${insumo.EXISTENCIA} ${insumo.UNIDAD_MEDIDA}`, '', insumo.ID)

            }

            if( insumo.CANTIDAD_MINIMA > insumo.EXISTENCIA) {   // Por debajo del limite
                
                // Notificar a los usuarios
                await notificar(1, `Necesitan más ${insumo.NOMBRE.toLowerCase()}`, `Aún queda poca existencia de ${insumo.NOMBRE.toLowerCase()}, la cantidad existente es inferior a la cantidad mínima. Cantidad Mínima: ${insumo.CANTIDAD_MINIMA} ${insumo.UNIDAD_MEDIDA}, Existencia actual: ${insumo.EXISTENCIA} ${insumo.UNIDAD_MEDIDA}`, '', insumo.ID)

            }
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putAddInsumoCompraExistente = async (req = request, res = response) => {

}

module.exports = {
    getCompras,
    getCompra,
    postCompra,
    putAddInsumoCompraExistente
}
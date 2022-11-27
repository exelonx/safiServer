const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewEstado = require('../../models/pedido/sql-vista/view_estado');
const Mesa = require('../../models/pedido/mesa');
const Pedido = require('../../models/pedido/pedido');
const Caja = require('../../models/pedido/caja');
const ViewMesa = require('../../models/pedido/sql-vista/view_mesa');
const ViewPedido = require('../../models/pedido/sql-vista/view_pedido');
const ViewDetallePedido = require('../../models/pedido/sql-vista/view_detalle');
const ViewProducto = require('../../models/catalogo-ventas/sql-vistas/view_producto');
const ViewCatalogoVenta = require('../../models/pedido/sql-vista/view_catalogo_ventas');
const { emit } = require('../../helpers/notificar');
const DetallePedido = require('../../models/pedido/detallePedido');

const getMesas = async (req = request, res = response) => {
    try {
        
        const mesas = await ViewMesa.findAll({
            where: { 
                [Op.not]: [
                    {[Op.or]: [{
                        ID_ESTADO: 5
                    },{
                        ID_ESTADO: 6
                    }]}
                ]
            } 
        });

        res.json({mesas})

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const getPedidosPorMesa = async (req = request, res = response) => {
    
    const { id_mesa } = req.params
    
    try {
        //Buscar en la tabla de pedidos filtrando por estado
        const pedidos = await ViewPedido.findAll({
            where: { 
                ID_MESA: id_mesa,
                [Op.not]: [
                    {[Op.or]: [{
                        ID_ESTADO: 5
                    },{
                        ID_ESTADO: 6
                    }]}
                ]
            } 
        });
        if(!pedidos){
            const { NOMBRE } = await Mesa.findByPk(id_mesa) //Conseguir el nombre del estado
            return res.status(404).json({
                msg: "No se encuentran pedidos en la mesa: " + NOMBRE
            })
        }
        res.json( {pedidos} )
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

// const getPedidoMesa

const getDetalleDelPedido = async (req = request, res = response) => { 

    const { id_pedido } = req.params
    try {
    
        const detalleDePedido = await ViewDetallePedido.findAll( { where: { ID_PEDIDO: id_pedido } } );    //Filtrar por pedidos
        //Validar Existencia
        if(!detalleDePedido){
            return res.status(404).json({
                ok: false,
                msg: "No existe productos asignados al pedido N°: "+id_pedido
            })
        } 
        res.json( {detalleDePedido} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const getBebidas = async (req = request, res = response) => {
    try {
        
        bebidas = await ViewProducto.findAll({
            where: {
                [Op.not]: [{
                    ESTADO: false 
                }],
                BEBIDA: true
            }
        });

        res.json({bebidas})

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const postMesaPedido = async (req = request, res = response) => {
    
    let { tipoPedido = "", nombre = "", id_usuario = "", informacion = "", arregloNombres = [] } = req.body

    try {

        // Verificar que haya una caja abierta
        const caja = await Caja.findOne({
            where: {
                ESTADO: true
            }
        })

        if(!caja) {
            // Respuesta
            return res.status(404).json({
                ok: false,
                msg: 'Se necesita abrir la caja'
            })
        }

        // Crear Mesa
        const mesa = await Mesa.create({
            NOMBRE: nombre,
            INFORMACION: informacion,
            TIPO: tipoPedido
        })

        if(arregloNombres.length > 0) {
            for await(nombre of arregloNombres) {
                await Pedido.create({
                    ID_USUARIO: id_usuario,
                    ID_MESA: mesa.id,
                    ID_CAJA: caja.id,
                    NOMBRE_CLIENTE: nombre,
                    MODIFICADO_POR: id_usuario
                })
            }
        } else {
            await Pedido.create({
                ID_USUARIO: id_usuario,
                ID_MESA: mesa.id,
                ID_CAJA: caja.id,
                NOMBRE_CLIENTE: nombre,
                MODIFICADO_POR: id_usuario
            })
        } 

        let id = mesa.id

        emit('mesa', {id});

        // Respuesta
        res.json({
            ok: true, 
            msg: 'Pedido '+ nombre.toLowerCase() +' creado'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const getMesa = async (req = request, res = response) => {
    const { id_mesa } = req.params
    try {
        
        const mesa = await ViewMesa.findOne({
            where: { 
                ID: id_mesa,
                [Op.not]: [
                    {[Op.or]: [{
                        ID_ESTADO: 5
                    },{
                        ID_ESTADO: 6
                    }]}
                ]
            } 
        });

        res.json({mesa})

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const validarCaja = async (req = request, res = response) => { 

    try {
        const caja = await Caja.findOne({
            where: {
                ESTADO: true
            }
        })

        if(!caja) {
            // Respuesta
            return res.status(404).json(false)
        }

        return res.json(true)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const getProductosParaAgregar = async (req = request, res = response) => {

    let { buscar = "", idTipoProducto = "", idCategoria = "" } = req.query
    filtrarTipo = {};
    filtrarCategoria = {};
    let productos = "";
    let fechaActual = new Date();
    let indices = [];

    try {

        if(idTipoProducto !== "") {
            filtrarTipo = {
                ID_TIPO_PRODUCTO: idTipoProducto
            }
        }

        if(idCategoria === "") {
            // Paginación
            productos = await ViewProducto.findAll({
                where: {
                    [Op.or]: [
                    {
                        NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    }],
                    [Op.not]: [{
                        ESTADO: false 
                    }],
                    [Op.and]: [filtrarTipo]
                }
            });
        } else {
            productos = await ViewCatalogoVenta.findAll({
                where: {
                    [Op.or]: [
                        {
                            NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                        }],
                        [Op.not]: [{
                            ESTADO: false 
                        }],
                        [Op.and]: [filtrarTipo, {ID_CATALOGO: idCategoria}]
                }
            })
        }

        productos.forEach((producto, i) => {
            if(producto.ID_TIPO_PRODUCTO == 3) {
                if(producto.FECHA_INICIO > fechaActual || producto.FECHA_FINAL < fechaActual) {
                    indices.push(i)
                }
            }
        });

        indices.forEach((indice) => {
            productos.splice(indice, 1)
        })

        // Respuesta
        res.json({ productos })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const postDetalle = async (req = request, res = response) => {
    const { arregloProductos = [], id_pedido, id_usuario } = req.body
    try {

        // Traer el pedido
        let pedido = await ViewPedido.findByPk(id_pedido)

        // Asignar el subtotal actual
        let subTotal = parseFloat(pedido.SUBTOTAL);

        // Agregar cada uno de los productos al detalle
        for await(let producto of arregloProductos) {
            let precio = parseFloat(producto.producto.PRECIO) / (1.00 + parseFloat(producto.producto.PORCENTAJE/100));
            let totalImpuesto = parseFloat(precio) * (parseFloat(producto.producto.PORCENTAJE/100));

            subTotal += (parseFloat(precio.toFixed(2)) + parseFloat(totalImpuesto.toFixed(2)))*producto.cantidad

            console.log(producto.producto)
            await DetallePedido.create({
                ID_PEDIDO: id_pedido,
                ID_PRODUCTO: producto.producto.ID,
                PARA_LLEVAR: producto.comerAqui,
                CANTIDAD: producto.cantidad,
                TOTAL_IMPUESTO: parseFloat(totalImpuesto.toFixed(2)),
                PRECIO_DETALLE: parseFloat(precio.toFixed(2)),
                PORCENTAJE_IMPUESTO: producto.producto.PORCENTAJE,
                INFORMACION: producto.informacion
            })
        }

        // Actualizar el pedido
        await Pedido.update({
            SUBTOTAL: subTotal.toFixed(2),
            MODIFICADO_POR: id_usuario,
            ID_ESTADO: 1    // Al recibir pendientes, el estado pasa a pendiente de nuevo
        }, {
            where: {
                id: id_pedido
            }
        }) 

        let pedidoPayload = await ViewPedido.findByPk(id_pedido);

        // Mandar el id para que solo se refresque la tabla correspondiente
        emit('productoAgregado', {id_pedido, pedidoPayload});

        res.json({
            ok: true,
            msg: `${arregloProductos.length} ${arregloProductos.length > 1 ? 'productos agregados': 'producto agregado'} al pedido de ${pedido.NOMBRE_CLIENTE}`
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

module.exports = {
    postMesaPedido,
    validarCaja,
    getMesas,
    getPedidosPorMesa,
    getDetalleDelPedido,
    getProductosParaAgregar,
    getBebidas,
    getMesa,
    postDetalle
}
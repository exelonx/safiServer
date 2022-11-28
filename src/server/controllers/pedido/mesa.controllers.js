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
const { emit, notificar } = require('../../helpers/notificar');
const DetallePedido = require('../../models/pedido/detallePedido');
const Producto = require('../../models/catalogo-ventas/producto');
const InsumoProducto = require('../../models/catalogo-ventas/insumoProducto');
const ComboProducto = require('../../models/catalogo-ventas/comboProducto');
const ViewInsumo = require('../../models/inventario/sql-vista/view-insumo');
const PromocionProducto = require('../../models/catalogo-ventas/promocionProducto');
const Kardex = require('../../models/inventario/kardex');

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

            let totalImpuesto = 0;

            if(!producto.EXENTA) {

                totalImpuesto = parseFloat(precio) * (parseFloat(producto.producto.PORCENTAJE/100));
            }

            subTotal += (parseFloat(precio.toFixed(2)))*producto.cantidad

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

        // Actualizar estado de mesa
        await Mesa.update({
            ID_ESTADO: 1
        }, {
            where: {
                id: pedido.ID_MESA
            }
        })

        let pedidoPayload = await ViewPedido.findByPk(id_pedido);
        let mesaVista = await ViewMesa.findByPk(pedido.ID_MESA)

        // Mandar el id para que solo se refresque la tabla correspondiente
        emit('productoAgregado', {id_pedido, pedidoPayload});

        let idMesa = pedido.ID_MESA
        emit('actualizarMesa', {idMesa, mesaVista})

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

const putEstadoDetalle = async (req = request, res = response) => {
    const { id_detalle } = req.params
    const { id_usuario } = req.body
    try {
      // Instanciar todos los objetos
      const detalleVista = await ViewDetallePedido.findByPk(id_detalle);
      const detalle = await DetallePedido.findByPk(id_detalle);
      const producto = await Producto.findByPk(detalle.ID_PRODUCTO);
      const pedido = await Pedido.findByPk(detalle.ID_PEDIDO);

      switch (detalleVista.ID_ESTADO) {
        case 1: // Pendiente
          // Verificar si el producto tiene estado
          if (producto.SIN_ESTADO) {
            // Actualizar pedido
            await detalle.update({
              ID_ESTADO: 4,
            });

            // ----------------------------------------- CONTROLAR INVENTARIO ------------------------------------

            // Comprobar si es un producto o combo o promocion
            if (producto.ID_TIPO_PRODUCTO == 1) {
              // Producto
              // Instanciar la cantidad de insumo usada
              const insumos = await InsumoProducto.findAll({
                where: { ID_PRODUCTO: detalle.ID_PRODUCTO },
              });

              for await (let insumo of insumos) {
                // Reducir existencia
                await Kardex.create({
                  ID_USUARIO: id_usuario,
                  ID_INSUMO: insumo.ID_INSUMO,
                  CANTIDAD: insumo.CANTIDAD,
                  TIPO_MOVIMIENTO: "SERVIDO",
                });

                // Notificar si es menor en existencia
                // Traer insumo
                const insumoVista = await ViewInsumo.findByPk(insumo.ID_INSUMO);

                if (insumoVista.CANTIDAD_MINIMA >= insumoVista.EXISTENCIA) {
                  // Por debajo del limite

                  // Notificar a los usuarios
                  await notificar(
                    1,
                    `Necesitan más ${insumoVista.NOMBRE.toLowerCase()}`,
                    `Aún queda poca existencia de ${insumoVista.NOMBRE.toLowerCase()}, la cantidad existente es inferior a la cantidad mínima. Cantidad Mínima: ${
                      insumoVista.CANTIDAD_MINIMA
                    } ${insumoVista.UNIDAD_MEDIDA}, Existencia actual: ${
                      insumoVista.EXISTENCIA
                    } ${insumoVista.UNIDAD_MEDIDA}`,
                    "",
                    insumoVista.ID
                  );
                }
              }
            }

            if (producto.ID_TIPO_PRODUCTO == 2) {
              // COMBO
              // Traer todos los productos del combo
              const productos = await ComboProducto.findAll({
                where: { ID_COMBO: detalle.ID_PRODUCTO },
              });

              // Recorrer todos los productos
              for await (let productoCombo of productos) {
                if (productoCombo.ESTADO) {
                  // Verificar que todavia exista

                  // Instanciar la cantidad de insumo usada
                  const insumos = await InsumoProducto.findAll({
                    where: { ID_PRODUCTO: productoCombo.id },
                  });

                  //recorrer cada insumo
                  for await (let insumo of insumos) {
                    // Reducir existencia
                    await Kardex.create({
                      ID_USUARIO: id_usuario,
                      ID_INSUMO: insumo.ID_INSUMO,
                      CANTIDAD:
                        parseFloat(insumo.CANTIDAD) * productoCombo.CANTIDAD, // Reducir por la cantidad de productos usados
                      TIPO_MOVIMIENTO: "SERVIDO",
                    });

                    // Notificar si es menor en existencia
                    // Traer insumo
                    const insumoVista = await ViewInsumo.findByPk(
                      insumo.ID_INSUMO
                    );

                    if (insumoVista.CANTIDAD_MINIMA >= insumoVista.EXISTENCIA) {
                      // Por debajo del limite

                      // Notificar a los usuarios
                      await notificar(
                        1,
                        `Necesitan más ${insumoVista.NOMBRE.toLowerCase()}`,
                        `Aún queda poca existencia de ${insumoVista.NOMBRE.toLowerCase()}, la cantidad existente es inferior a la cantidad mínima. Cantidad Mínima: ${
                          insumoVista.CANTIDAD_MINIMA
                        } ${insumoVista.UNIDAD_MEDIDA}, Existencia actual: ${
                          insumoVista.EXISTENCIA
                        } ${insumoVista.UNIDAD_MEDIDA}`,
                        "",
                        insumoVista.ID
                      );
                    }
                  }
                }
              }
            }

            if (producto.ID_TIPO_PRODUCTO == 3) {
              // PROMOCION

              // Traer todos los productos de la promoción
              const productos = await PromocionProducto.findAll({
                where: { ID_PROMOCION: detalle.ID_PRODUCTO },
              });

              // Recorrer todos los productos
              for await (let productoPromo of productos) {
                if (productoPromo.ESTADO) {
                  // Verificar que todavia exista
                  // Instanciar la cantidad de insumo usada
                  const insumos = await InsumoProducto.findAll({
                    where: { ID_PRODUCTO: productoPromo.id },
                  });
                  //recorrer cada insumo
                  for await (let insumo of insumos) {
                    // Reducir existencia
                    await Kardex.create({
                      ID_USUARIO: id_usuario,
                      ID_INSUMO: insumo.ID_INSUMO,
                      CANTIDAD:
                        parseFloat(insumo.CANTIDAD) * productoPromo.CANTIDAD,
                      TIPO_MOVIMIENTO: "SERVIDO",
                    });

                    // Notificar si es menor en existencia
                    // Traer insumo
                    const insumoVista = await ViewInsumo.findByPk(
                      insumo.ID_INSUMO
                    );

                    if (insumoVista.CANTIDAD_MINIMA >= insumoVista.EXISTENCIA) {
                      // Por debajo del limite

                      // Notificar a los usuarios
                      await notificar(
                        1,
                        `Necesitan más ${insumoVista.NOMBRE.toLowerCase()}`,
                        `Aún queda poca existencia de ${insumoVista.NOMBRE.toLowerCase()}, la cantidad existente es inferior a la cantidad mínima. Cantidad Mínima: ${
                          insumoVista.CANTIDAD_MINIMA
                        } ${insumoVista.UNIDAD_MEDIDA}, Existencia actual: ${
                          insumoVista.EXISTENCIA
                        } ${insumoVista.UNIDAD_MEDIDA}`,
                        "",
                        insumoVista.ID
                      );
                    }
                  }
                }
              }
            }

          } else {
            // Actualizar pedido
            await detalle.update({
              ID_ESTADO: 2,
            });

          }

          break;

        case 2: // Cocinando
          // Actualizar pedido
          await detalle.update({
            ID_ESTADO: 3, // LISTO!!!!
          });

          // ----------------------------------------- CONTROLAR INVENTARIO ------------------------------------

          // Comprobar si es un producto o combo o promocion
          if (producto.ID_TIPO_PRODUCTO == 1) {
            // Producto
            // Instanciar la cantidad de insumo usada
            const insumos = await InsumoProducto.findAll({
              where: { ID_PRODUCTO: detalle.ID_PRODUCTO },
            });

            for await (let insumo of insumos) {
              // Reducir existencia
              await Kardex.create({
                ID_USUARIO: id_usuario,
                ID_INSUMO: insumo.ID_INSUMO,
                CANTIDAD: insumo.CANTIDAD,
                TIPO_MOVIMIENTO: "UTILIZADO",
              });

              // Notificar si es menor en existencia
              // Traer insumo
              const insumoVista = await ViewInsumo.findByPk(insumo.ID_INSUMO);

              if (insumoVista.CANTIDAD_MINIMA >= insumoVista.EXISTENCIA) {
                // Por debajo del limite

                // Notificar a los usuarios
                await notificar(
                  1,
                  `Necesitan más ${insumoVista.NOMBRE.toLowerCase()}`,
                  `Aún queda poca existencia de ${insumoVista.NOMBRE.toLowerCase()}, la cantidad existente es inferior a la cantidad mínima. Cantidad Mínima: ${
                    insumoVista.CANTIDAD_MINIMA
                  } ${insumoVista.UNIDAD_MEDIDA}, Existencia actual: ${
                    insumoVista.EXISTENCIA
                  } ${insumoVista.UNIDAD_MEDIDA}`,
                  "",
                  insumoVista.ID
                );
              }
            }
          }

          if (producto.ID_TIPO_PRODUCTO == 2) {
            // COMBO
            // Traer todos los productos del combo
            const productos = await ComboProducto.findAll({
              where: { ID_COMBO: detalle.ID_PRODUCTO },
            });

            // Recorrer todos los productos
            for await (let productoCombo of productos) {
              
                // Verificar que todavia exista

                // Instanciar la cantidad de insumo usada
                const insumos = await InsumoProducto.findAll({
                  where: { ID_PRODUCTO: productoCombo.ID_PRODUCTO },
                });

                //recorrer cada insumo
                for await (let insumo of insumos) {
                  // Reducir existencia
                  await Kardex.create({
                    ID_USUARIO: id_usuario,
                    ID_INSUMO: insumo.ID_INSUMO,
                    CANTIDAD:
                      parseFloat(insumo.CANTIDAD) * productoCombo.CANTIDAD, // Reducir por la cantidad de productos usados
                    TIPO_MOVIMIENTO: "UTILIZADO",
                  });

                  // Notificar si es menor en existencia
                  // Traer insumo
                  const insumoVista = await ViewInsumo.findByPk(
                    insumo.ID_INSUMO
                  );

                  if (insumoVista.CANTIDAD_MINIMA >= insumoVista.EXISTENCIA) {
                    // Por debajo del limite

                    // Notificar a los usuarios
                    await notificar(
                      1,
                      `Necesitan más ${insumoVista.NOMBRE.toLowerCase()}`,
                      `Aún queda poca existencia de ${insumoVista.NOMBRE.toLowerCase()}, la cantidad existente es inferior a la cantidad mínima. Cantidad Mínima: ${
                        insumoVista.CANTIDAD_MINIMA
                      } ${insumoVista.UNIDAD_MEDIDA}, Existencia actual: ${
                        insumoVista.EXISTENCIA
                      } ${insumoVista.UNIDAD_MEDIDA}`,
                      "",
                      insumoVista.ID
                    );
                  }
                
              }
            }
          }

          if (producto.ID_TIPO_PRODUCTO == 3) {
            // PROMOCION

            // Traer todos los productos de la promoción
            const productos = await PromocionProducto.findAll({
              where: { ID_PROMOCION: detalle.ID_PRODUCTO },
            });

            // Recorrer todos los productos
            for await (let productoPromo of productos) {
              
                // Verificar que todavia exista
                // Instanciar la cantidad de insumo usada
                const insumos = await InsumoProducto.findAll({
                  where: { ID_PRODUCTO: productoPromo.ID_PRODUCTO },
                });
                //recorrer cada insumo
                for await (let insumo of insumos) {
                  // Reducir existencia
                  await Kardex.create({
                    ID_USUARIO: id_usuario,
                    ID_INSUMO: insumo.ID_INSUMO,
                    CANTIDAD:
                      parseFloat(insumo.CANTIDAD) * productoPromo.CANTIDAD,
                    TIPO_MOVIMIENTO: "UTILIZADO",
                  });

                  // Notificar si es menor en existencia
                  // Traer insumo
                  const insumoVista = await ViewInsumo.findByPk(
                    insumo.ID_INSUMO
                  );

                  if (insumoVista.CANTIDAD_MINIMA >= insumoVista.EXISTENCIA) {
                    // Por debajo del limite

                    // Notificar a los usuarios
                    await notificar(
                      1,
                      `Necesitan más ${insumoVista.NOMBRE.toLowerCase()}`,
                      `Aún queda poca existencia de ${insumoVista.NOMBRE.toLowerCase()}, la cantidad existente es inferior a la cantidad mínima. Cantidad Mínima: ${
                        insumoVista.CANTIDAD_MINIMA
                      } ${insumoVista.UNIDAD_MEDIDA}, Existencia actual: ${
                        insumoVista.EXISTENCIA
                      } ${insumoVista.UNIDAD_MEDIDA}`,
                      "",
                      insumoVista.ID
                    );
                  }
                }
              
            }
          }

          break;

        case 3: // Listo
          // Actualizar pedido
          await detalle.update({
            ID_ESTADO: 4, // SERVIDISIMOOOOO!!!!!!!
          });
          break;

        default:
          break;
      }

      // --------------------------------------------- Validar estados -------------------------------------

      // Traer el detalle actualizado
      const detalles = await DetallePedido.findAll({
        order: [['ID_ESTADO', 'DESC']],
        where: {
            ID_PEDIDO: detalle.ID_PEDIDO,
        },
      });

      let idEstadoNuevo = 1; // Pendiente
      
      // Recorrer todos los detalles
      for await (let unDetalle of detalles) {

        if (unDetalle.ID_ESTADO === 4) {
            // Servido
            idEstadoNuevo = 4;
        }

        if (unDetalle.ID_ESTADO === 3) {
            idEstadoNuevo = 3
        } 
        
        if (unDetalle.ID_ESTADO === 2) {
            idEstadoNuevo = 2
        }

        if (unDetalle.ID_ESTADO === 1){
            idEstadoNuevo = 1
        }
        
      }

      // Si hay cambio en el estado del todo el pedido, actualizar pantallas
      const pedidoVista = await ViewPedido.findByPk(pedido.id);

      // Actualizar estado del pedido y usuario quien modifico
      await pedido.update({
        MODIFICADO_POR: id_usuario,
        ID_ESTADO: idEstadoNuevo,
      });

      let idPedido = pedido.id;
      const newPedidoVista = await ViewPedido.findByPk(pedido.id);
      emit("actualizarTabla", { idPedido, newPedidoVista });

      // Instanciar todos los pedidos de la mesa
      const pedidosMesa = await Pedido.findAll({
        order: [['ID_ESTADO', 'DESC']],       //El último siempre dira en que estado esta la orden
        where: { ID_MESA: pedido.ID_MESA },
      });

      let idEstadoMesaNuevo = 4;
      for await (let pedidoMesa of pedidosMesa) {
        if (pedidoMesa.ID_ESTADO === 4) {
            // Servido
            idEstadoMesaNuevo = 4;
        } 
        
        if (pedidoMesa.ID_ESTADO === 3) {
            // Listo
            idEstadoMesaNuevo = 3;
        } else
        
        if (pedidoMesa.ID_ESTADO === 2) {
            // Cocinando
            idEstadoMesaNuevo = 2;
        } 
        
        if (pedidoMesa.ID_ESTADO === 1) {
            idEstadoMesaNuevo = 1
        }
      }

      // Instanciar mesa
      const mesa = await Mesa.findByPk(pedido.ID_MESA);
      await mesa.update({
        ID_ESTADO: idEstadoMesaNuevo,
      });

      // Actualizar la mesa a los usuarios
      let idMesa = mesa.id;
      const mesaVista = await ViewMesa.findByPk(pedido.ID_MESA);
      emit("actualizarMesa", { idMesa, mesaVista });

      res.json({ ok: true });
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
    postDetalle,
    putEstadoDetalle
}
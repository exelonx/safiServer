const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const Producto = require('../../models/catalogo-ventas/producto');
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewProducto = require('../../models/catalogo-ventas/sql-vistas/view_producto');
const InsumoProducto = require('../../models/catalogo-ventas/insumoProducto');
const CatalogoProducto = require('../../models/catalogo-ventas/categoriaProducto');
const ComboProducto = require('../../models/catalogo-ventas/comboProducto');
const PromocionProducto = require('../../models/catalogo-ventas/promocionProducto');
const ViewCatalogoProducto = require('../../models/catalogo-ventas/sql-vistas/view_catalogo_producto');
const ViewComboProducto = require('../../models/catalogo-ventas/sql-vistas/view_comboProducto');
const ViewPromocionProducto = require('../../models/catalogo-ventas/sql-vistas/view_promocionProducto');
const ViewInsumoProducto = require('../../models/inventario/sql-vista/view_insumoProducto');
const ViewCatalogoVenta = require('../../models/pedido/sql-vista/view_catalogo_ventas');

// Llamar todas las preguntas paginadas
const getProductos = async (req = request, res = response) => {

    let { limite, desde = 0, buscar = "", quienBusco = "", idTipoProducto = 1 } = req.query

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
        const productos = await ViewProducto.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    PORCENTAJE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    PRECIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }],
                [Op.not]: [{
                    ESTADO: false 
                }],
                [Op.and]: [{
                    ID_TIPO_PRODUCTO: idTipoProducto
                }]
            }
        });

        // Contar resultados total
        const countProducto = await ViewProducto.count({
            where: {
                [Op.or]: [{
                    PORCENTAJE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    PRECIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }],
                [Op.not]: [{
                    ESTADO: false 
                }],
                [Op.and]: [{
                    ID_TIPO_PRODUCTO: idTipoProducto
                }]
            }
        });

        // Guardar evento
        if (buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 18, 'CONSULTA', `SE BUSCÓ EL PRODUCTO CON EL TÉRMINO: '${buscar}'`);
        }

        // Respuesta
        res.json({ limite, countProducto, productos })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo Producto
const getProducto = async (req = request, res = response) => {
     
    const { id } = req.params

    try {
        
        const producto = await ViewProducto.findByPk( id );

        // Validar Existencia
        if( !producto ){
            return res.status(404).json({
                msg: 'No existe un producto con el id ' + id
            })
        }

        res.json({ producto })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const postProducto = async (req = request, res = response) => {
    //body
    const { nombre, precio, impuesto, descripcion, exenta, esBebida, sinEstado, arregloInsumo = [], arregloCategoria = [], id_usuario } = req.body;

    try {
 
        //Construir modelo e insertar
        const nuevoProducto = await Producto.create({
            ID_IMPUESTO: impuesto,
            ID_TIPO_PRODUCTO: 1,
            NOMBRE: nombre,
            PRECIO: precio,
            EXENTA: exenta,
            DESCRIPCION: descripcion,
            SIN_ESTADO: sinEstado,
            BEBIDA: esBebida,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        });

        for await(let insumo of arregloInsumo) {
            await InsumoProducto.create({
                ID_INSUMO: insumo.insumo,
                ID_PRODUCTO: nuevoProducto.id,
                CANTIDAD: insumo.cantidad
            })
        }

        for await(let categoria of arregloCategoria) {
            await CatalogoProducto.create({
                ID_PRODUCTO: nuevoProducto.id,
                ID_CATALOGO: categoria
            })
        }
        
        // Guardar evento
        eventBitacora(new Date, id_usuario, 18, 'NUEVO', `SE CREO UN NUEVO PRODUCTO ${nuevoProducto.NOMBRE}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Producto: '+ nombre + ' ha sido creada con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const postCombo = async (req = request, res = response) => {
    //body
    const { nombre, precio, impuesto, descripcion, sinEstado, arregloProductos = [], arregloCategoria = [], id_usuario } = req.body;

    try {

        //Construir modelo e insertar
        const nuevoCombo = await Producto.create({
            ID_IMPUESTO: impuesto,
            ID_TIPO_PRODUCTO: 2,
            NOMBRE: nombre,
            PRECIO: precio,
            EXENTA: false,
            DESCRIPCION: descripcion,
            SIN_ESTADO: sinEstado,
            BEBIDA: false,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        });

        for await(let producto of arregloProductos) {
            await ComboProducto.create({
                ID_COMBO: nuevoCombo.id,
                ID_PRODUCTO: producto.producto,
                CANTIDAD: producto.cantidad
            })
        }

        for await(let categoria of arregloCategoria) {
            await CatalogoProducto.create({
                ID_PRODUCTO: nuevoCombo.id,
                ID_CATALOGO: categoria
            })
        }

        // Guardar evento
        eventBitacora(new Date, id_usuario, 18, 'NUEVO', `SE CREO UN NUEVO COMBO ${nuevoCombo.NOMBRE}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Combo: '+ nombre + ' ha sido creada con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const postPromocion = async (req = request, res = response) => {
    //body
    const { nombre, precio, impuesto, descripcion, sinEstado, arregloProductos = [], arregloCategoria = [], id_usuario, fecha_final, fecha_inicio } = req.body;

    try {

        //Construir modelo e insertar
        const nuevoPromocion = await Producto.create({
            ID_IMPUESTO: impuesto,
            ID_TIPO_PRODUCTO: 3,
            NOMBRE: nombre,
            PRECIO: precio,
            EXENTA: false,
            DESCRIPCION: descripcion,
            SIN_ESTADO: sinEstado,
            BEBIDA: false,
            FECHA_INICIO: fecha_inicio,
            FECHA_FINAL: fecha_final,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        });

        for await(let producto of arregloProductos) {
            await PromocionProducto.create({
                ID_PROMOCION: nuevoPromocion.id,
                ID_PRODUCTO: producto.producto,
                CANTIDAD: producto.cantidad
            })
        }

        for await(let categoria of arregloCategoria) {
            await CatalogoProducto.create({
                ID_PRODUCTO: nuevoPromocion.id,
                ID_CATALOGO: categoria
            })
        }

        // Guardar evento
        eventBitacora(new Date, id_usuario, 18, 'NUEVO', `SE CREO UNA NUEVA PROMOCION ${nuevoPromocion.NOMBRE}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Promoción: '+ nombre + ' ha sido creada con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putProducto = async (req = request, res = response) => {
    const { id } = req.params
    const { id_usuario = "", id_impuesto = "", id_tipo_producto = "", nombre = "", precio = "", exenta = "",
            descripcion = "", fecha_inicio = "", fecha_final = "", sin_estado = "", bebida = "", imagen = "" } = req.body;

    try {

        const producto = await Producto.findByPk(id);
        
        // Si llega sin cambios
        if(!((producto.ID_IMPUESTO == id_impuesto || id_impuesto === "")
            &&(producto.ID_TIPO_PRODUCTO == id_tipo_producto || id_tipo_producto === "")
            &&(producto.NOMBRE == nombre || nombre === "")
            &&(producto.PRECIO == precio || precio === "")
            &&(producto.EXENTA == exenta || exenta === "")
            &&(producto.DESCRIPCION == descripcion || descripcion === "")
            &&(producto.FECHA_INICIO == fecha_inicio || fecha_inicio === "")
            &&(producto.FECHA_FINAL == fecha_final || fecha_final === "")
            &&(producto.SIN_ESTADO == sin_estado || sin_estado === "")
            &&(producto.BEBIDA == bebida || bebida === "")
            &&(producto.IMAGEN == imagen || imagen === ""))) {

                eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', 
                             `DATOS ACTUALIZADOS: ${id_impuesto !== "" && producto.ID_IMPUESTO!= id_impuesto
                              ?`${producto.ID_IMPUESTO} actualizado a ${id_impuesto}`: ""}
                              ${id_tipo_producto !== "" && producto.ID_TIPO_PRODUCTO!= id_tipo_producto
                              ?`${producto.ID_TIPO_PRODUCTO} actualizado a ${id_tipo_producto}`: ""}
                              ${nombre !== "" && producto.NOMBRE!= nombre
                              ?`${producto.NOMBRE} actualizado a ${nombre}`: ""}
                              ${precio !== "" && producto.PRECIO!= precio
                              ?`${producto.PRECIO} actualizado a ${precio}`: ""}
                              ${exenta !== "" && producto.EXENTA!= exenta
                              ?`${producto.EXENTA} actualizado a ${exenta}`: ""}
                              ${descripcion !== "" && producto.DESCRIPCION!= descripcion
                              ?`${producto.DESCRIPCION} actualizado a ${descripcion}`: ""}
                              ${fecha_inicio !== "" && producto.FECHA_INICIO!= fecha_inicio
                              ?`${producto.FECHA_INICIO} actualizado a ${fecha_inicio}`: ""}
                              ${fecha_final !== "" && producto.FECHA_FINAL!= fecha_final
                              ?`${producto.FECHA_FINAL} actualizado a ${fecha_final}`: ""}
                              ${sin_estado !== "" && producto.SIN_ESTADO!= sin_estado
                              ?`${producto.SIN_ESTADO} actualizado a ${sin_estado}`: ""}
                              ${bebida !== "" && producto.BEBIDA!= bebida
                              ?`${producto.BEBIDA} actualizado a ${bebida}`: ""}
                              ${imagen !== "" && producto.IMAGEN!= imagen
                              ?`${producto.IMAGEN} actualizado a ${imagen}`: ""}
                              `);

        }

        // Actualizar db Producto
        await Producto.update({
            ID_IMPUESTO: id_impuesto !== "" ? id_impuesto : Producto.ID_IMPUESTO,
            ID_TIPO_PRODUCTO: id_tipo_producto !== "" ? id_tipo_producto : Producto.ID_TIPO_PRODUCTO,
            NOMBRE: nombre !== "" ? nombre : Producto.NOMBRE,
            PRECIO: precio !== "" ? precio : Producto.PRECIO,
            EXENTA: exenta !== "" ? exenta : Producto.EXENTA,
            DESCRIPCION: descripcion !== "" ? descripcion : Producto.DESCRIPCION,
            FECHA_INICIO: fecha_inicio !== "" ? fecha_inicio : Producto.FECHA_INICIO,
            FECHA_FINAL: fecha_final !== "" ? fecha_final : Producto.FECHA_FINAL,
            SIN_ESTADO: sin_estado !== "" ? sin_estado : Producto.SIN_ESTADO,
            BEBIDA: bebida !== "" ? bebida : Producto.BEBIDA,
            IMAGEN: imagen !== "" ? imagen : Producto.IMAGEN,
        }, {
            where: {
                ID: id
            }
        })

        res.json({
            ok: true,
            msg: 'Producto: '+ producto.NOMBRE + ' ha sido actualizada con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const deleteProducto = async (req = request, res = response) => {

    const { id } = req.params;
    const { quienElimina } = req.query;
    let mensaje = "";
    let respuesta = "";

    try {

        // Llamar el producto a borrar
        const producto = await Producto.findByPk( id );

        // Extraer el nombre del producto
        const { NOMBRE } = producto;

        // Borrar producto
        producto.update({
            ESTADO: false
        })

        // Eliminarlo de combos y promociones
        await PromocionProducto.destroy({where: {
            ID_PRODUCTO: producto.id
        }})

        await ComboProducto.destroy({where: {
            ID_PRODUCTO: producto.id
        }})

        if(producto.ID_TIPO_PRODUCTO == 1) {
            mensaje = 'EL PRODUCTO'
            respuesta = 'El producto'
        } else if(producto.ID_TIPO_PRODUCTO == 2){
            mensaje = 'EL COMBO'
            respuesta = 'El combo'
        } else {
            mensaje = 'LA PROMOCIÓN'
            respuesta = 'La promoción'
        }

        // Guardar evento
        eventBitacora(new Date, quienElimina, 18, 'BORRADO', `SE ELIMINO ${mensaje} ${NOMBRE}`);

        res.json({
            ok: true,
            msg: `${respuesta}: ${NOMBRE} ha sido eliminado`
        });

    } catch (error) {
        if( error instanceof ForeignKeyConstraintError ) {
            res.status(403).json({
                ok: false,
                msg: `El producto no puede ser eliminado`
            })
        } else {
            console.log(error);
            res.status(500).json({
                msg: error.message
            })
        }
    }  
}

// Llamar la lista de catalogo producto para la pantalla de productos
const getCatalogoProducto = async (req = request, res = response) => {

    const {id_producto} = req.params

    try {

        const catalogoProducto = await ViewCatalogoProducto.findAll({where: {
            ID_PRODUCTO: id_producto
        }});
        
        // Respuesta
        res.json({ catalogoProducto })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const getComboProducto = async (req = request, res = response) => {

    const {id_producto} = req.params

    try {

        const comboProducto = await ViewComboProducto.findAll({where: {
            ID_COMBO: id_producto
        }});
        
        // Respuesta
        res.json({ comboProducto })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const getPromoProducto = async (req = request, res = response) => {

    const {id_producto} = req.params

    try {

        const promocionProducto = await ViewPromocionProducto.findAll({where: {
            ID_PROMOCION: id_producto
        }});
        
        // Respuesta
        res.json({ promocionProducto })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putInfoProducto = async (req = request, res = response) => {

    const {id_producto} = req.params;
    const {
        nombre = "", 
        precio = "", 
        id_impuesto = "", 
        descripcion = "", 
        estado = "", 
        bebida = "", 
        exento = "", 
        fecha_inicio = "", 
        fecha_final = "",
        id_usuario = ""
    } = req.body;

    try {

        const productoModelo = await Producto.findByPk(id_producto);

        if(!productoModelo) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe este producto'
            })
        }

        // Si llega con cambios se registran cambios y manda correo
        if(!((productoModelo.NOMBRE == nombre || nombre === "") 
            && (productoModelo.PRECIO == precio || precio === "") 
            && (productoModelo.ID_IMPUESTO == id_impuesto || id_impuesto === "") 
            && (productoModelo.DESCRIPCION == descripcion || descripcion === "")
            && (productoModelo.SIN_ESTADO == estado || estado === "")
            && (productoModelo.BEBIDA == bebida || bebida === "")
            && (productoModelo.EXENTA == exento || exento === "")
            && (productoModelo.FECHA_INICIO == fecha_inicio || fecha_inicio === "")
            && (productoModelo.FECHA_FINAL == fecha_final || fecha_final === ""))) {

            let tipoProducto = "";
            if(productoModelo.ID_TIPO_PRODUCTO === 1) {
                tipoProducto = 'AL PRODUCTO ' + productoModelo.NOMBRE
            }
            if(productoModelo.ID_TIPO_PRODUCTO === 2) {
                tipoProducto = 'AL COMBO ' +productoModelo.NOMBRE
            }
            if(productoModelo.ID_TIPO_PRODUCTO === 3) {
                tipoProducto = 'A LA PROMOCION ' +productoModelo.NOMBRE
            }
              
            eventBitacora(
              new Date(),
              id_usuario,
              18,
              "ACTUALIZACION",
              `DATOS ACTUALIZADOS ${tipoProducto}: ${
                nombre !== "" && productoModelo.NOMBRE != nombre
                  ? "`NOMBRE`"
                  : ""
              }
            ${
              estado !== "" && productoModelo.SIN_ESTADO != estado
                ? "`SIN_ESTADO`"
                : ""
            } ${
                id_impuesto !== "" && productoModelo.ID_IMPUESTO != id_impuesto
                  ? "`IMPUESTO`"
                  : ""
              } ${
                precio !== "" && productoModelo.PRECIO != precio
                  ? "`PRECIO`"
                  : ""
              } ${
                descripcion !== "" && productoModelo.DESCRIPCION != descripcion
                  ? "`DESCRIPCION`"
                  : ""
              } ${
                bebida !== "" && productoModelo.BEBIDA != bebida
                  ? "`ES_BEBIDA`"
                  : ""
              } ${
                exento !== "" && productoModelo.EXENTA != exento
                  ? "`ES_EXENTO`"
                  : ""
              } ${
                fecha_inicio !== "" && productoModelo.FECHA_INICIO != fecha_inicio
                  ? "`FECHA_INICIO`"
                  : ""
              } ${
                fecha_final !== "" && productoModelo.FECHA_FINAL != fecha_final
                  ? "`FECHA_FINAL`"
                  : ""
              }`
            );

        }

        // Actualizar db Usuario
        await productoModelo.update({
            NOMBRE: nombre !== "" ? nombre : productoModelo.NOMBRE,
            PRECIO: precio !== "" ? precio : productoModelo.PRECIO,
            ID_IMPUESTO: id_impuesto !== "" ? id_impuesto : productoModelo.ID_IMPUESTO,
            DESCRIPCION: descripcion !== "" ? descripcion : productoModelo.DESCRIPCION,
            SIN_ESTADO: estado !== "" ? estado : productoModelo.SIN_ESTADO,
            BEBIDA: bebida !== "" ? bebida : productoModelo.BEBIDA,
            EXENTA: exento !== "" ? exento : productoModelo.EXENTA,
            FECHA_INICIO: fecha_inicio !== "" ? fecha_inicio : productoModelo.FECHA_INICIO,
            FECHA_FINAL: fecha_final !== "" ? fecha_final : productoModelo.FECHA_FINAL,
            MODIFICADO_POR: id_usuario
        })

        let tipoProducto = "";
        if(productoModelo.ID_TIPO_PRODUCTO === 1) {
            tipoProducto = 'El producto'
        }
        if(productoModelo.ID_TIPO_PRODUCTO === 2) {
            tipoProducto = 'El combo'
        }
        if(productoModelo.ID_TIPO_PRODUCTO === 3) {
            tipoProducto = 'La promoción'
        }

        return res.json({
            ok: true,
            msg: `${tipoProducto} ha sido actualizado con éxito`
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const putInsumoProducto = async (req = request, res = response) => {
    const { id_insumoDetalle } = req.params;
    const { nuevo_insumo = 0, nueva_cantidad = 0.00, id_usuario = "" } = req.body;

    try {
        
        // Instanciar el insumo producto
        const insumoProducto = await InsumoProducto.findByPk(id_insumoDetalle);

        // Instanciar el producto
        const producto = await Producto.findByPk(insumoProducto.ID_PRODUCTO);

        if( insumoProducto.ID_INSUMO == nuevo_insumo && nueva_cantidad == insumoProducto.CANTIDAD) {
            const nuevoInsumo = await ViewInsumoProducto.findByPk(id_insumoDetalle)

            let nombreInsumo = nuevoInsumo.NOMBRE_INSUMO;
            return res.json({
                ok: true,
                msg: 'No hay cambios',
                nombreInsumo
            })
        }

        // Actualizar quién modifico
        await producto.update({
            MODIFICADO_POR: id_usuario
        })

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `MODIFICACIÓN EN LOS INSUMOS DE ${producto.NOMBRE}`); 

        // Actualizar producto
        await insumoProducto.update({
            ID_INSUMO: nuevo_insumo,
            CANTIDAD: nueva_cantidad
        })

        const nuevoInsumo = await ViewInsumoProducto.findByPk(id_insumoDetalle)

        let nombreInsumo = nuevoInsumo.NOMBRE_INSUMO;

        return res.json({
            ok: true,
            msg: 'Actualización del insumo con éxito',
            nombreInsumo
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putCatalogoProducto = async (req = request, res = response) => {
    const { id_catalogoProducto } = req.params;
    const { nueva_categoria = 0, id_usuario = "" } = req.body;

    try {
        
        // Instanciar el insumo producto
        const categoriaProducto = await CatalogoProducto.findByPk(id_catalogoProducto);

        // Instanciar el producto
        const producto = await Producto.findByPk(categoriaProducto.ID_PRODUCTO);

        if( categoriaProducto.ID_CATALOGO == nueva_categoria) {
            const nuevaCategoria = await ViewCatalogoProducto.findByPk(id_catalogoProducto)
            let nombreCategoria = nuevaCategoria.NOMBRE_CATALOGO
            return res.json({
                ok: true,
                msg: 'No hay cambios',
                nombreCategoria
            })
        }

        // Actualizar quién modifico
        await producto.update({
            MODIFICADO_POR: id_usuario
        })

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `MODIFICACIÓN EN LAS CATEGORÍAS DE ${producto.NOMBRE}`); 

        // Actualizar producto
        await categoriaProducto.update({
            ID_CATALOGO: nueva_categoria
        })

        const nuevaCategoria = await ViewCatalogoProducto.findByPk(id_catalogoProducto)
        let nombreCategoria = nuevaCategoria.NOMBRE_CATALOGO
        return res.json({
            ok: true,
            msg: 'Actualización de la categoría con éxito',
            nombreCategoria
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putMasCatalogoProducto = async (req = request, res = response) => {
    try {
        const {id_producto} = req.params
        const {id_usuario = "", arregloCatalogo = []} = req.body
        let catalogoProductoMapped = "";

        catalogoProductoMapped = await arregloCatalogo.map( catalogo => {
            return {
                ID_PRODUCTO: id_producto,
                ID_CATALOGO: catalogo
            }
        })

        await CatalogoProducto.bulkCreate(catalogoProductoMapped)

        const nuevoCatalogoProducto = await ViewCatalogoProducto.findAll({where: {ID_PRODUCTO: id_producto}})

        const producto = await Producto.findByPk(id_producto);

        producto.update({
            MODIFICADO_POR: id_usuario
        })

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `INSERCIÓN EN LAS CATEGORÍAS DE ${producto.NOMBRE}`); 

        return res.json({
            ok: true,
            msg: 'Actualización de la categoría con éxito',
            nuevoCatalogoProducto
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putMasInsumoProducto = async (req = request, res = response) => {
    try {
        const {id_producto} = req.params
        const {id_usuario = "", arregloInsumo = []} = req.body
        let insumoProductoMapped = "";

        insumoProductoMapped = await arregloInsumo.map( insumo => {
            return {
                ID_PRODUCTO: id_producto,
                ID_INSUMO: insumo.insumo,
                CANTIDAD: insumo.cantidad
            }
        })

        await InsumoProducto.bulkCreate(insumoProductoMapped)

        const nuevoInsumoProducto = await ViewInsumoProducto.findAll({where: {ID_PRODUCTO: id_producto}})

        const producto = await Producto.findByPk(id_producto);

        producto.update({
            MODIFICADO_POR: id_usuario
        })

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `INSERCIÓN DE NUEVO INSUMOS EN ${producto.NOMBRE}`); 

        return res.json({
            ok: true,
            msg: 'Actualización del producto con éxito',
            nuevoInsumoProducto
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const deleteUnInsumo = async (req = request, res = response) => {
    const {idInsumoProducto} = req.params
    const {id_usuario} = req.body
    try {
        const insumoProducto = await InsumoProducto.findByPk(idInsumoProducto);
        const producto = await Producto.findByPk(insumoProducto.ID_PRODUCTO);
        await producto.update({
            MODIFICADO_POR: id_usuario
        });

        await insumoProducto.destroy();

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `ELIMINACIÓN EN LOS INSUMOS DE ${producto.NOMBRE}`); 

        // Responder
        res.json({
            ok:true,
            msg: 'Insumo ha sido eliminado del producto'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const deleteUnaCategoria = async (req = request, res = response) => {
    const {idCategoriaProducto} = req.params
    const {id_usuario} = req.body
    try {
        const catalogoProducto = await CatalogoProducto.findByPk(idCategoriaProducto);
        const producto = await Producto.findByPk(catalogoProducto.ID_PRODUCTO);
        await producto.update({
            MODIFICADO_POR: id_usuario
        });

        await catalogoProducto.destroy();

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `ELIMINACIÓN EN LAS CATEGORÍAS DE ${producto.NOMBRE}`); 

        // Responder
        res.json({
            ok:true,
            msg: 'La Categoría ha sido eliminada del producto'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putMasComboProducto = async (req = request, res = response) => {
    try {
        const {id_producto} = req.params
        const {id_usuario = "", arregloProducto = []} = req.body
        let comboProductoMapped = "";

        comboProductoMapped = await arregloProducto.map( producto => {
            return {
                ID_PRODUCTO: producto.producto,
                ID_COMBO: id_producto,
                CANTIDAD: producto.cantidad
            }
        })

        await ComboProducto.bulkCreate(comboProductoMapped)

        const nuevoComboProducto = await ViewComboProducto.findAll({where: {ID_COMBO: id_producto}})

        const producto = await Producto.findByPk(id_producto);

        producto.update({
            MODIFICADO_POR: id_usuario
        })

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `INSERCIÓN DE NUEVOS PRODUCTOS EN ${producto.NOMBRE}`); 

        return res.json({
            ok: true,
            msg: 'Actualización del combo con éxito',
            nuevoComboProducto
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const deleteComboProducto = async (req = request, res = response) => {
    const {idComboProducto} = req.params
    const {id_usuario} = req.body
    try {
        const comboProducto = await ComboProducto.findByPk(idComboProducto);
        const producto = await Producto.findByPk(comboProducto.ID_COMBO);
        await producto.update({
            MODIFICADO_POR: id_usuario
        });

        await comboProducto.destroy();

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `ELIMINACIÓN EN LOS PRODUCTOS DE ${producto.NOMBRE}`); 

        // Responder
        res.json({
            ok:true,
            msg: 'El producto ha sido eliminado del combo'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putComboProducto = async (req = request, res = response) => {
    const { id_comboDetalle } = req.params;
    const { nuevo_producto = 0, nueva_cantidad = 0.00, id_usuario = "" } = req.body;

    try {
        
        // Instanciar el insumo producto
        const comboProducto = await ComboProducto.findByPk(id_comboDetalle);

        // Instanciar el producto
        const producto = await Producto.findByPk(comboProducto.ID_COMBO);

        if( comboProducto.ID_PRODUCTO == nuevo_producto && nueva_cantidad == comboProducto.CANTIDAD) {
            const nuevoInsumo = await ViewComboProducto.findByPk(id_comboDetalle)

            let nombreCombo = nuevoInsumo.NOMBRE_INSUMO;
            return res.json({
                ok: true,
                msg: 'No hay cambios',
                nombreCombo
            })
        }

        // Actualizar quién modifico
        await producto.update({
            MODIFICADO_POR: id_usuario
        })

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `MODIFICACIÓN EN LOS PRODUCTOS DE ${producto.NOMBRE}`); 

        // Actualizar producto
        await comboProducto.update({
            ID_PRODUCTO: nuevo_producto,
            CANTIDAD: nueva_cantidad
        })

        const nuevoCombo = await ViewComboProducto.findByPk(id_comboDetalle)

        let nombreCombo = nuevoCombo.NOMBRE_PRODUCTO;

        return res.json({
            ok: true,
            msg: 'Actualización del producto del combo con éxito',
            nombreCombo
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putMasPromocionProducto = async (req = request, res = response) => {
    try {
        const {id_producto} = req.params
        const {id_usuario = "", arregloProducto = []} = req.body
        let promoProductoMapped = "";

        promoProductoMapped = await arregloProducto.map( producto => {
            return {
                ID_PRODUCTO: producto.producto,
                ID_PROMOCION: id_producto,
                CANTIDAD: producto.cantidad
            }
        })

        await PromocionProducto.bulkCreate(promoProductoMapped)

        const nuevoPromoProducto = await ViewPromocionProducto.findAll({where: {ID_PROMOCION: id_producto}})

        const producto = await Producto.findByPk(id_producto);

        producto.update({
            MODIFICADO_POR: id_usuario
        })

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `INSERCIÓN DE NUEVOS PRODUCTOS EN ${producto.NOMBRE}`); 

        return res.json({
            ok: true,
            msg: 'Actualización del combo con éxito',
            nuevoPromoProducto
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const putPromocionProducto = async (req = request, res = response) => {
    const { id_promoDetalle } = req.params;
    const { nuevo_producto = 0, nueva_cantidad = 0.00, id_usuario = "" } = req.body;

    try {
        
        // Instanciar el insumo producto
        const promoProducto = await PromocionProducto.findByPk(id_promoDetalle);

        // Instanciar el producto
        const producto = await Producto.findByPk(promoProducto.ID_PROMOCION);

        if( promoProducto.ID_PRODUCTO == nuevo_producto && nueva_cantidad == promoProducto.CANTIDAD) {
            const nuevoPromo = await ViewPromocionProducto.findByPk(id_promoDetalle)

            let nombrePromo = nuevoPromo.NOMBRE_PRODUCTO;
            return res.json({
                ok: true,
                msg: 'No hay cambios',
                nombrePromo
            })
        }

        // Actualizar quién modifico
        await producto.update({
            MODIFICADO_POR: id_usuario
        })

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `MODIFICACIÓN EN LOS PRODUCTOS DE ${producto.NOMBRE}`); 

        // Actualizar producto
        await promoProducto.update({
            ID_PRODUCTO: nuevo_producto,
            CANTIDAD: nueva_cantidad
        })

        const nuevoPromo = await ViewPromocionProducto.findByPk(id_promoDetalle)

        let nombrePromo = nuevoPromo.NOMBRE_PRODUCTO;

        return res.json({
            ok: true,
            msg: 'Actualización del producto de la promoción con éxito',
            nombrePromo
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const deletePromoProducto = async (req = request, res = response) => {
    const {idPromoProducto} = req.params
    const {id_usuario} = req.body
    try {
        const promoProducto = await PromocionProducto.findByPk(idPromoProducto);
        const producto = await Producto.findByPk(promoProducto.ID_PROMOCION);
        await producto.update({
            MODIFICADO_POR: id_usuario
        });

        await promoProducto.destroy();

        eventBitacora(new Date, id_usuario, 18, 'ACTUALIZACION', `ELIMINACIÓN EN LOS PRODUCTOS DE ${producto.NOMBRE}`); 

        // Responder
        res.json({
            ok:true,
            msg: 'El producto ha sido eliminado de la promoción'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}


module.exports = {
    getProductos,
    getProducto,
    postProducto,
    postCombo,
    postPromocion,
    putProducto,
    deleteProducto,
    getCatalogoProducto,
    getComboProducto,
    getPromoProducto,
    putInfoProducto,
    putInsumoProducto,
    putCatalogoProducto,
    putMasCatalogoProducto,
    putMasInsumoProducto,
    deleteUnInsumo,
    deleteUnaCategoria,
    putComboProducto,
    putMasComboProducto,
    deleteComboProducto,
    putPromocionProducto,
    putMasPromocionProducto,
    deletePromoProducto
}
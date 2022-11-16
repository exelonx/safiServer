const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");

const Producto = require('../../models/catalogo-ventas/producto');
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewProducto = require('../../models/catalogo-ventas/sql-vistas/view_producto');

// Llamar todas las preguntas paginadas
const getProductos = async (req = request, res = response) => {

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

        // Paginación
        const productos = await ViewProducto.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [
                    {
                        PORCENTAJE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        TIPO_PRODUCTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        PRECIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        FECHA_INICIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        FECHA_FINAL: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    },
                    {
                        MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                    }
                ]
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
                    TIPO_PRODUCTO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    PRECIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    FECHA_INICIO: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    FECHA_FINAL: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                },
                {
                    MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
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
    const { id_usuario = "", id_impuesto = "", id_tipo_producto = "", nombre = "", precio = "", exenta = "", descripcion = "", fecha_inicio = "", fecha_final = "", sin_estado = "", bebida = "", imagen = "" } = req.body;
    
    try {
 
        // Construir modelo
        const nuevoProducto = await Producto.build({
            ID_IMPUESTO: id_impuesto,
            ID_TIPO_PRODUCTO: id_tipo_producto,
            NOMBRE: nombre,
            PRECIO: precio,
            EXENTA: exenta,
            DESCRIPCION: descripcion,
            FECHA_INICIO: fecha_inicio,
            FECHA_FINAL: fecha_final,
            SIN_ESTADO: sin_estado,
            BEBIDA: bebida,
            IMAGEN: imagen,
            CREADO_POR: id_usuario,
            MODIFICADO_POR: id_usuario
        });
        // Insertar a DB
        await nuevoProducto.save();   
        
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
    const { id } = req.params
    const { quienElimina } = req.query

    try {

        // Llamar el producto a borrar
        const producto = await Producto.findByPk( id );

        // Extraer el nombre de la producto
        const { NOMBRE } = producto;

        // Borrar producto
        await producto.destroy();

        // Guardar evento
        eventBitacora(new Date, quienElimina, 18, 'BORRADO', `SE ELIMINO EL PRODUCTO ${NOMBRE}`);

        res.json({
            ok: true,
            msg: `El producto: ${NOMBRE} ha sido eliminado`
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

module.exports = {
    getProductos,
    getProducto,
    postProducto,
    putProducto,
    deleteProducto
}
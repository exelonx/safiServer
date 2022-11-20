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
const jwt = require('jsonwebtoken');
const Kardex = require('../../models/inventario/kardex');

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
    const token = req.header('x-token');
    const { id_detalle } = req.params;
    const { nuevo_insumo = 0, nueva_cantidad = 0.00, nuevo_precio = '' } = req.body;
    let mensajeNotificacion = "";
    try {
        // Extraer el id del usuario
        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_LOGIN );

        // Instanciar item del detalle
        const detalle = await CompraDetalle.findByPk(id_detalle);

        // Instanciar compra
        const compra = await Compra.findByPk(detalle.ID_COMPRA);

        if( detalle.ID_INSUMO == nuevo_insumo && nueva_cantidad == detalle.CANTIDAD && nuevo_precio == detalle.PRECIO_COMPRA) {
            return res.json({
                ok: true,
                msg: 'No hay cambios'
            })
        }

        // Cambios en el precio actualiza compra
        if( (detalle.PRECIO_COMPRA * detalle.CANTIDAD).toFixed(2) != (parseFloat(nuevo_precio) * parseFloat(nueva_cantidad)).toFixed(2) ) {

            const insumo = await ViewInsumo.findByPk(detalle.ID_INSUMO);
            let total = compra.TOTAL_PAGADO;
            total -= (detalle.PRECIO_COMPRA * detalle.CANTIDAD);
            total += (parseFloat(nuevo_precio) * parseFloat(nueva_cantidad))

            // Actualizar precio de compra
            compra.update({
                TOTAL_PAGADO: parseFloat(total),
                MODIFICADO_POR: uid,
                FECHA_MODIFICACION: new Date()
            });

            eventBitacora(new Date, uid, 23, 'ACTUALIZACION', `Cambio en el precio unitario de la compra de ${insumo.NOMBRE}, precio anterior: ${detalle.PRECIO_COMPRA} Lps, nuevo precio: ${parseFloat(nueva_cantidad).toFixed(2)}`); 

            mensajeNotificacion = `Cambio en el precio unitario de la compra, precio anterior: ${detalle.PRECIO_COMPRA} Lps, nuevo precio: ${parseFloat(nueva_cantidad).toFixed(2)}.`

            // Actualizar precio del insumo
            detalle.update({
                PRECIO_COMPRA: parseFloat(nuevo_precio),
            })

        }
        
        // Cambios en el insumo (MODIFICA EXISTENCIA EN INVENTARIO)
        if(detalle.ID_INSUMO != nuevo_insumo) {
            const anteriorInsumo = await ViewInsumo.findByPk(detalle.ID_INSUMO);
            const nuevoInsumo = await ViewInsumo.findByPk(nuevo_insumo)

            // TODO: INSTANCIAR KARDEX para insertar
            await Kardex.create({   // Devolución
                ID_USUARIO: uid,
                ID_INSUMO: detalle.ID_INSUMO,
                CANTIDAD: parseFloat(detalle.CANTIDAD).toFixed(2),
                TIPO_MOVIMIENTO: 'DEVOLUCIÓN'
            })   

            await Kardex.create({   // Entrada
                ID_USUARIO: uid,
                ID_INSUMO: nuevo_insumo,
                CANTIDAD: parseFloat(nueva_cantidad).toFixed(2),
                TIPO_MOVIMIENTO: 'ENTRADA'
            })  

            // Actualizar quién modifico
            compra.update({
                MODIFICADO_POR: uid,
                FECHA_MODIFICACION: new Date()
            });

            // Actualizar Detalle
            detalle.update({
                // POR SI LAS MOSCAS
                PRECIO_COMPRA: parseFloat(nuevo_precio),
                CANTIDAD: parseFloat(nueva_cantidad).toFixed(2),
                ID_INSUMO: nuevo_insumo
            })

            eventBitacora(new Date, uid, 23, 'ACTUALIZACION', `Devolución de ${detalle.CANTIDAD} ${anteriorInsumo.UNIDAD_MEDIDA} de ${anteriorInsumo.NOMBRE}, ingreso de ${nueva_cantidad.toFixed(2)} ${nuevoInsumo.UNIDAD_MEDIDA} de ${nuevoInsumo.NOMBRE}`);
            mensajeNotificacion = `${mensajeNotificacion.length>0 ? `${mensajeNotificacion}` : ""}Devolución de ${detalle.CANTIDAD} ${anteriorInsumo.UNIDAD_MEDIDA} de ${anteriorInsumo.NOMBRE}, ingreso de ${nueva_cantidad.toFixed(2)} ${nuevoInsumo.UNIDAD_MEDIDA} de ${nuevoInsumo.NOMBRE}.`

        } else {    // ES EL MISMO INSUMO

            const insumo = await ViewInsumo.findByPk(detalle.ID_INSUMO);

            // Cambios en la cantidad
            if(detalle.CANTIDAD > nueva_cantidad) {

                await Kardex.create({   // DEVOLUCIÓN
                    ID_USUARIO: uid,
                    ID_INSUMO: detalle.ID_INSUMO,
                    CANTIDAD: parseFloat(detalle.CANTIDAD - nueva_cantidad).toFixed(2),
                    TIPO_MOVIMIENTO: 'DEVOLUCIÓN'
                }) 

                eventBitacora(new Date, uid, 23, 'ACTUALIZACION', `DEVOLUCIÓN DE ${detalle.CANTIDAD - nueva_cantidad} ${insumo.UNIDAD_MEDIDA} DE ${insumo.NOMBRE}`); 
                mensajeNotificacion = `${mensajeNotificacion.length>0 ? `${mensajeNotificacion} ` : ""}Devolución de ${detalle.CANTIDAD - nueva_cantidad} ${insumo.UNIDAD_MEDIDA} de ${insumo.NOMBRE}.`

                // Actualizar Detalle
                detalle.update({
                    // POR SI LAS MOSCAS
                    PRECIO_COMPRA: parseFloat(nuevo_precio),
                    CANTIDAD: parseFloat(nueva_cantidad).toFixed(2),
                })

            }
    
            if( detalle.CANTIDAD < nueva_cantidad) {

                await Kardex.create({   // ENTRADA
                    ID_USUARIO: uid,
                    ID_INSUMO: detalle.ID_INSUMO,
                    CANTIDAD: parseFloat(nueva_cantidad - detalle.CANTIDAD).toFixed(2),
                    TIPO_MOVIMIENTO: 'ENTRADA'
                }) 

                eventBitacora(new Date, uid, 23, 'ACTUALIZACION', `ENTRADA DE ${nueva_cantidad - detalle.CANTIDAD} ${insumo.UNIDAD_MEDIDA} DE ${insumo.NOMBRE}`); 
                mensajeNotificacion = `Entrada de ${nueva_cantidad - detalle.CANTIDAD} ${insumo.UNIDAD_MEDIDA} de ${insumo.NOMBRE}`

                // Actualizar Detalle
                detalle.update({
                    // POR SI LAS MOSCAS
                    PRECIO_COMPRA: parseFloat(nuevo_precio),
                    CANTIDAD: parseFloat(nueva_cantidad).toFixed(2),
                })

            }

        }

        res.json({
            ok: true,
            msg: 'Actualización con éxito',
            detalle,
            compra
        })

        // Notificar a los usuarios
        if(mensajeNotificacion !== "") {

            await notificar(1, `Actualización de compra # ${compra.id}`, mensajeNotificacion, '', detalle.ID_INSUMO)

        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putMasInsumosEnDetalle = async (req = request, res = response) => {
    const token = req.header('x-token');
    const { id_compra } = req.params;
    const { arregloDetalle = "", total = "" } = req.body;
    let error = false;    // Para evitar crasheo del servidor
    let indice = 0;
    let detalleMapped = ""

    try {

        // Extraer el id del usuario
        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_LOGIN );

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

        // Mapear el detalle para que lo acepte la tabla
        detalleMapped = await arregloDetalle.map( detalle => {
            return {
                ID_INSUMO: detalle.insumo,
                CANTIDAD: detalle.cantidad,
                PRECIO_COMPRA: detalle.precio,
                ID_COMPRA: id_compra
            }
        } );

        // Insertar detalle
        const nuevo_detalle = await CompraDetalle.bulkCreate(detalleMapped);

        const compraActual = await Compra.findByPk(id_compra);
        const totalPagado = compraActual.TOTAL_PAGADO;
        await compraActual.update({
            TOTAL_PAGADO: (parseFloat(totalPagado) + parseFloat(total)).toFixed(2),
            MODIFICADO_POR: uid
        })

        const nuevoTotal = compraActual.TOTAL_PAGADO
        // Responder
        res.json({
            ok:true,
            nuevo_detalle,
            nuevoTotal,
            msg: 'Actualización con éxito'
        })

        // =================================== NOTIFICAR ===================================
        
        for await (detalle of detalleMapped) {

            // Traer insumo
            const insumo = await ViewInsumo.findByPk(detalle.ID_INSUMO)

            // Registrar en bitacora
            eventBitacora(new Date, uid, 23, 'ACTUALIZACION', `SE AGREGÓ UNA NUEVA COMPRA DE ${detalle.CANTIDAD} ${insumo.UNIDAD_MEDIDA} DE ${insumo.NOMBRE} A LA COMPRA # ${id_compra}`);

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

const deleteUnDetalle = async (req = request, res = response) => {
    const { id_detalle } = req.params;
    const token = req.header('x-token');

    try {

        // Extraer el id del usuario
        const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_LOGIN );

        const detalle = await CompraDetalle.findByPk(id_detalle);

        // Cambiar precio
        const compra = await Compra.findByPk(detalle.ID_COMPRA);

        let nuevoTotal = (parseFloat(compra.TOTAL_PAGADO) - parseFloat(detalle.PRECIO_COMPRA)).toFixed(2)
        
        await compra.update({
            TOTAL_PAGADO: nuevoTotal,
            MODIFICADO_POR: uid
        })

        // TODO: INSTANCIAR KARDEX para insertar
        await Kardex.create({   // Devolución
            ID_USUARIO: uid,
            ID_INSUMO: detalle.ID_INSUMO,
            CANTIDAD: parseFloat(detalle.CANTIDAD).toFixed(2),
            TIPO_MOVIMIENTO: 'DEVOLUCIÓN'
        })   

        
        // Para notificar
        const id_insumo = detalle.ID_INSUMO
        const insumo = await ViewInsumo.findByPk(id_insumo)

        // Registrar en bitacora
        eventBitacora(new Date, uid, 23, 'BORRADO', `DEVOLUCIÓN DE ${detalle.CANTIDAD} ${insumo.UNIDAD_MEDIDA} DE ${insumo.NOMBRE}`);
        
        // ELIMINAR
        await detalle.destroy()

        // Responder
        res.json({
            ok:true,
            nuevoTotal,
            msg: 'Insumo ha sido eliminado del detalle'
        })

        // NOTIFICAR
        // Verificar si la compra del insumo esta en limites correctos
        if( insumo.CANTIDAD_MAXIMA < insumo.EXISTENCIA) {   // Por encima del limite
            
            // Notificar a los usuarios
            await notificar(1, `Exceso de ${insumo.NOMBRE.toLowerCase()}`, `Existencia de ${insumo.NOMBRE.toLowerCase()} esta por encima de la cantidad máxima. Cantidad Máxima: ${insumo.CANTIDAD_MAXIMA} ${insumo.UNIDAD_MEDIDA}, Existencia actual: ${insumo.EXISTENCIA} ${insumo.UNIDAD_MEDIDA}`, '', insumo.ID)

        }

        if( insumo.CANTIDAD_MINIMA > insumo.EXISTENCIA) {   // Por debajo del limite
            
            // Notificar a los usuarios
            await notificar(1, `Necesitan más ${insumo.NOMBRE.toLowerCase()}`, `Aún queda poca existencia de ${insumo.NOMBRE.toLowerCase()}, la cantidad existente es inferior a la cantidad mínima. Cantidad Mínima: ${insumo.CANTIDAD_MINIMA} ${insumo.UNIDAD_MEDIDA}, Existencia actual: ${insumo.EXISTENCIA} ${insumo.UNIDAD_MEDIDA}`, '', insumo.ID)

        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

module.exports = {
    getCompras,
    getCompra,
    postCompra,
    putAddInsumoCompraExistente,
    putMasInsumosEnDetalle,
    deleteUnDetalle
}
const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const Caja = require('../../models/pedido/caja');
const { eventBitacora } = require('../../helpers/event-bitacora');

// // Llamar todas las cajas paginadas
const getCajas = async (req = request, res = response) => {
    
    let { limite = 10, desde = 0, buscar = "", quienBusco = "", fechaInicial ="", fechaFinal="" } = req.query
    let filtrarPorFecha = {};

    try {

        // Definir el número de objetos a mostrar
        if(!limite || limite === ""){
            const { VALOR } = await Parametro.findOne({where: {PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
            limite = VALOR;
        }

        if(desde === ""){
            desde = 0;
        }

        // Validar si llegaron fechas
        if( fechaFinal !== '' && fechaInicial !== '') {
            filtrarPorFecha = { 
                FECHA_APERTURA:{
                    [Op.between]:[new Date(fechaInicial), new Date(fechaFinal)]
                } 
            }
        }

        // Paginación
        const cajas = await Caja.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                ESTADO: '0'
            },
            [Op.or]: [filtrarPorFecha]
        });

        // Contar resultados total
        const countCajas = await Caja.count({
            where: {
                ESTADO: '0'
            },
            [Op.or]: [filtrarPorFecha]
        });

        // Guardar evento
        // if( buscar !== "" && desde == 0) {
        //     eventBitacora(new Date, quienBusco, 26, 'CONSULTA', `SE BUSCO LAS UNIDADES CON EL TERMINO '${buscar}'`);
        // }

        // Respuesta
        res.json( {limite, countCajas, cajas} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar a una sola caja 
const getCaja = async (req = request, res = response) => {
     
    const { id } = req.params

    try {
        
        const caja = await Caja.findByPk( id );

        // Validar Existencia
        if( !caja ){
            return res.status(404).json({
                msg: 'No existe una caja con el id ' + id
            })
        }

        res.json({ caja })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar a la caja que esta abierta
const getCajaAbierta = async (req = request, res = response) => {

    try {

        const cajaAbierta = await Caja.findAll({
            where: {
                ESTADO: '1'
            }
        })

        res.json({ cajaAbierta })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const postCaja = async (req = request, res = response) => {
    //body
    const { id_usuario = "", saldo_apertura } = req.body;
    
    try {

        const cajaAbierta = await Caja.findAll({where: {ESTADO: '1'}});
        if(saldo_apertura < 0){
            return res.status(400).json({
                ok: false,
                msg: 'Saldo no permitido'
            })
        }

        if(cajaAbierta){
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe una caja abierta'
            })
        }
 
        // Construir modelo
        const nuevaCaja = await Caja.create({
            SALDO_APERTURA: saldo_apertura
        }); 
        
        // // Guardar evento
        // eventBitacora(new Date, id_usuario, 16, 'NUEVO', `SE CREO UNA NUEVA UNIDAD ${nuevaUnidad.UNIDAD_MEDIDA}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'La caja esta abierta'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

// const putUnidad = async (req = request, res = response) => {
//     const { id } = req.params
//     const { id_usuario = "", unidad_medida = "" , nombre = ""} = req.body;
    
//     try {

//         const unidad = await Unidad.findByPk(id);
        
//         // Si llega sin cambios
//         if(!((unidad.UNIDAD_MEDIDA == unidad_medida || unidad_medida === ""))
//             && (unidad.NOMBRE == nombre || nombre === "") ) {

//                 eventBitacora(new Date, id_usuario, 16, 'ACTUALIZACION', `DATOS ACTUALIZADOS: ${unidad_medida !== "" ? 'UNIDAD_MEDIDA' : ""}`);

//         }

//         // Actualizar db Rol
//         await Unidad.update({
//             UNIDAD_MEDIDA: unidad_medida !== "" ? unidad_medida : Unidad.UNIDAD_MEDIDA,
//             NOMBRE: nombre !== "" ? nombre : Unidad.NOMBRE,
//         }, {
//             where: {
//                 ID: id
//             }
//         })

//         res.json({
//             ok: true,
//             msg: 'Unidad: '+ unidad.UNIDAD_MEDIDA + ' ha sido actualizada con éxito'
//         });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             ok: false,
//             msg: error.message
//         })
//     }
// }

// const deleteUnidad = async (req = request, res = response) => {
//     const { id } = req.params
//     const { quienElimina } = req.query

//     try {

//         // Llamar el proveedor a borrar
//         const unidad = await Unidad.findByPk( id );

//         // Extraer el nombre de la unidad
//         const { UNIDAD_MEDIDA } = unidad;

//         // Borrar unidad
//         await unidad.destroy();

//         // Guardar evento
//         eventBitacora(new Date, quienElimina, 16, 'BORRADO', `SE ELIMINO LA UNIDAD ${UNIDAD_MEDIDA}`);

//         res.json({
//             ok: true,
//             msg: `La unidad: ${UNIDAD_MEDIDA} ha sido eliminado`
//         });

//     } catch (error) {
//         if( error instanceof ForeignKeyConstraintError ) {
//             res.status(403).json({
//                 ok: false,
//                 msg: `La unidad de medida no puede ser eliminada`
//             })
//         } else {

//             console.log(error);
//             res.status(500).json({
//                 msg: error.message
//             })

//         }
//     }  
// }

module.exports = {
    getCajas,
    getCaja,
    getCajaAbierta,
    postCaja
}
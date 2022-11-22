const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const Sar = require('../../models/facturacion/sar');
const { eventBitacora } = require('../../helpers/event-bitacora');

// Llamar todas las preguntas paginadas
const getAllSAR = async (req = request, res = response) => {
    
    let { limite = 10, desde = 0, buscar = "", quienBusco = "" } = req.query

    try {

        // Definir el número de objetos a mostrar
        if(!limite || limite === ""){
            const { VALOR } = await Parametro.findOne({where: {PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
            limite = VALOR;
        }

        if(desde === ""){
            desde = 0;
        }

        // Paginación
        const sar = await Sar.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    CAI: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    RANGO_MINIMO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    RANGO_MAXIMO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    NUMERO_ACTUAL: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });

        // Contar resultados total
        const countSar = await Sar.count({where: {
                [Op.or]: [{
                    CAI: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    RANGO_MINIMO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    RANGO_MAXIMO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    NUMERO_ACTUAL: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }]
            }
        });

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 27, 'CONSULTA', `SE BUSCO AL CAI CON EL TÉRMINO '${buscar}'`);
        }

        // Respuesta
        res.json( {limite, countSar, sar} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo Proveedor
const getSAR = async (req = request, res = response) => {
     
    const { id } = req.params

    try {
        
        const sar = await Sar.findByPk( id );

        // Validar Existencia
        if( !sar ){
            return res.status(404).json({
                msg: 'No existe un CAI con el id ' + id
            })
        }

        res.json({ sar })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const postSAR = async (req = request, res = response) => {
    //body
    const { cai = "", rango_minimo = "", rango_maximo = "", fecha_autorizado = "", fecha_limite_emision = "" } = req.body;
    
    try {

        let caiValido = /^([A-Z0-9]{6}\-){5}([A-Z0-9]{2})$/;

        for(let i=0; i < cai.length; i++){
            if(caiValido.test(cai)){
                
            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `CAI inválido.`
                })
            }
        }

        let rango = /^(\d{3}\-){2}\d{2}\-\d{8}$/;

        for(let i=0; i < rango_minimo.length; i++){
            if(caiValido.test(rango_minimo)){
                
            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `Rango mínimo inválido.`
                })
            }
        }

        for(let i=0; i < rango_maximo.length; i++){
            if(caiValido.test(rango_maximo)){
                
            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `Rango máximo inválido.`
                })
            }
        }

        // Construir modole de direccion
        const nuevoSAR = await Sar.create({
            CAI: cai,
            RANGO_MINIMO: rango_minimo,
            RANGO_MAXIMO: rango_maximo,
            FECHA_AUTORIZADO: fecha_autorizado,
            FECHA_LIMITE_EMISION: fecha_limite_emision,
            NUMERO_ACTUAL: rango_minimo
        })
        
        // Guardar evento
        eventBitacora(new Date, id_usuario, 27, 'NUEVO', `SE CREO EL CAI ${nuevoSAR.CAI}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'CAI: '+ cai + ' ha sido creado con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

// const deleteProveedor = async (req = request, res = response) => {
//     const { id } = req.params
//     const { quienElimina } = req.query

//     try {

//         // Llamar el proveedor a borrar
//         const proveedor = await Proveedor.findByPk( id );

//         // Extraer el nombre del proveedor
//         const { NOMBRE } = proveedor;

//         // Borrar Proveedor
//         await proveedor.destroy();

//         // Guardar evento
//         eventBitacora(new Date, quienElimina, 15, 'BORRADO', `SE ELIMINO EL PROVEEDOR ${NOMBRE}`);

//         res.json({
//             ok: true,
//             msg: `El proveedor: ${NOMBRE} ha sido eliminado`
//         });

//     } catch (error) {
//         if( error instanceof ForeignKeyConstraintError ) {
//             res.status(403).json({
//                 ok: false,
//                 msg: `El proveedor no puede ser eliminado`
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
    getAllSAR,
    getSAR,
    postSAR,
    // deleteProveedor
}
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
        
        const unSar = await Sar.findByPk( id );

        // Validar Existencia
        if( !unSar ){
            return res.status(404).json({
                msg: 'No existe un CAI con el id ' + id
            })
        }

        res.json({ unSar })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const postSAR = async (req = request, res = response) => {
    //body
    const { cai = "", rango_minimo = "", rango_maximo = "", fecha_autorizado = "", fecha_limite_emision = "", id_usuario = "" } = req.body;
    
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
            if(rango.test(rango_minimo)){
                
            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `Rango mínimo inválido.`
                })
            }
        }

        for(let i=0; i < rango_maximo.length; i++){
            if(rango.test(rango_maximo)){
                
            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `Rango máximo inválido.`
                })
            }
        } 

        if (fecha_limite_emision < fecha_autorizado ) {
            return res.status(400).json({
                ok: false,
                msg: `La fecha límite no puede ser menor a la fecha de autorización.`
            })
        }

        if(rango_minimo > rango_maximo){
            return res.status(400).json({
                ok: false,
                msg: `El rango mínimo debe ser menor al rango máximo.`
            })
        }

        const todosLosCai = await Sar.findAll();

        for await (let cai of todosLosCai ){
            let rango_minimo = cai.RANGO_MAXIMO;
            let numero_actual = cai.NUMERO_ACTUAL;

            //Comparar rango minimo con rango maximo
            if (rango_minimo !== numero_actual) {
                return res.status(400).json({
                    ok: false,
                    msg: `Ya existe un CAI en uso.`
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

const putSAR = async (req = request, res = response) => {
    const { id } = req.params
    const { cai = "", rango_minimo = "", rango_maximo = "", fecha_autorizado = "", fecha_limite_emision = "", numero_actual = "" } = req.body;
    const { id_usuario = "" } = req.body;

    try {

        const sar = await Sar.findByPk(id);
        // Si llega sin cambios
        if(!((sar.CAI == cai || cai === "") 
            && (sar.RANGO_MINIMO == rango_minimo || rango_minimo === "")
            && (sar.RANGO_MAXIMO == rango_maximo || rango_maximo === "")
            && (sar.FECHA_AUTORIZADO == fecha_autorizado || fecha_autorizado === "")
            && (sar.FECHA_LIMITE_EMISION == fecha_limite_emision || fecha_limite_emision === "")
            && (sar.NUMERO_ACTUAL == numero_actual || numero_actual === ""))) {

                eventBitacora(new Date, id_usuario, 27, 'ACTUALIZACION', 
                `DATOS ACTUALIZADOS: ${cai !== "" && sar.CAI != cai ? `${sar.CAI} actualizado a ${cai}` : ""}
                 ${rango_minimo !== "" && sar.RANGO_MINIMO != rango_minimo ? `${sar.RANGO_MINIMO} actualizado a ${rango_minimo}` : ""}
                 ${rango_maximo !=="" && sar.RANGO_MAXIMO != rango_maximo ? `${sar.RANGO_MAXIMO} actualizado a ${rango_maximo}` :""}
                 ${fecha_autorizado !=="" && sar.FECHA_AUTORIZADO != fecha_autorizado ? `${sar.FECHA_AUTORIZADO} actualizado a ${fecha_autorizado}` :""}
                 ${fecha_limite_emision !=="" && sar.FECHA_LIMITE_EMISION != fecha_limite_emision ? `${sar.FECHA_LIMITE_EMISION} actualizado a ${fecha_limite_emision}` :""}
                 ${numero_actual !=="" && sar.NUMERO_ACTUAL != numero_actual ? `${sar.NUMERO_ACTUAL} actualizado a ${numero_actual}` :""}`);
        }
    

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
            if(rango.test(rango_minimo)){
                
            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `Rango mínimo inválido.`
                })
            }
        }

        for(let i=0; i < rango_maximo.length; i++){
            if(rango.test(rango_maximo)){
                
            } else {
                return res.status(400).json({
                    ok: false,
                    msg: `Rango máximo inválido.`
                })
            }
        }

        if(numero_actual < sar.NUMERO_ACTUAL){
            return res.status(400).json({
                ok: false,
                msg: `No puede ingresar un número anterior. Número actual: ${sar.NUMERO_ACTUAL}`
            })
        }
        
        if (fecha_limite_emision < fecha_autorizado ) {
            return res.status(400).json({
                ok: false,
                msg: `La fecha límite no puede ser menor a la fecha de autorización.`
            })
        }

        if(rango_minimo > rango_maximo){
            return res.status(400).json({
                ok: false,
                msg: `El rango mínimo debe ser menor al rango máximo.`
            })
        }

        // const todosLosCai = await Sar.findAll();

        // for await (let cai of todosLosCai ){
        //     let rango_minimo = cai.RANGO_MAXIMO;
        //     let numero_actual = cai.NUMERO_ACTUAL;

        //     //Comparar rango minimo con rango maximo
        //     if (rango_minimo !== numero_actual) {
        //         return res.status(400).json({
        //             ok: false,
        //             msg: `Ya existe un CAI en uso.`
        //         })              
        //     }
        // }

        // Actualizar db Proveedor
        await Sar.update({
            CAI: cai !== "" ? cai : sar.CAI,
            RANGO_MINIMO: rango_minimo !== "" ? rango_minimo : sar.RANGO_MINIMO,
            RANGO_MAXIMO: rango_maximo !== "" ? rango_maximo : sar.RANGO_MAXIMO,
            FECHA_AUTORIZADO: fecha_autorizado !== "" ? fecha_autorizado : sar.FECHA_AUTORIZADO,
            FECHA_LIMITE_EMISION: fecha_limite_emision !== "" ? fecha_limite_emision : sar.FECHA_LIMITE_EMISION,
            NUMERO_ACTUAL: numero_actual !== "" ? numero_actual : sar.NUMERO_ACTUAL,
        }, {
            where: {
                ID: id
            }
        })

        res.json({
            ok: true,
            msg: 'CAI: '+ sar.CAI + ' ha sido actualizado con éxito'
        });

    } catch (error) {
        console.log(error instanceof ForeignKeyConstraintError);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const deleteSAR = async (req = request, res = response) => {
    const { id } = req.params
    const { quienElimina } = req.query

    try {

        // Llamar el proveedor a borrar
        const sar = await Sar.findByPk( id );

        // Extraer el nombre del proveedor
        const { CAI } = sar;

        // Borrar Proveedor
        await sar.destroy();

        // Guardar evento
        eventBitacora(new Date, quienElimina, 27, 'BORRADO', `SE ELIMINO EL CAI ${CAI}`);

        res.json({
            ok: true,
            msg: `El CAI: ${CAI} ha sido eliminado`
        });

    } catch (error) {
        if( error instanceof ForeignKeyConstraintError ) {
            res.status(403).json({
                ok: false,
                msg: `El CAI no puede ser eliminado`
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
    getAllSAR,
    getSAR,
    postSAR,
    putSAR,
    deleteSAR
}
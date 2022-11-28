const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const Caja = require('../../models/pedido/caja');
const { eventBitacora } = require('../../helpers/event-bitacora');
const { emit } = require('../../helpers/notificar');

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


        console.log(fechaFinal, fechaInicial);

        // Validar si llegaron fechas
        if( fechaFinal !== '' && fechaInicial !== '') {
            filtrarPorFecha = { 
                
                FECHA_APERTURA: {

                    [Op.between]:[new Date(fechaInicial), new Date(fechaFinal)]

                }
 
            }
        }

        // Paginación
        const cajas = await Caja.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                ESTADO: '0',

                [Op.and]: [filtrarPorFecha]
            },
            
        });

        // Contar resultados total
        const countCajas = await Caja.count({
            where: {
                ESTADO: '0',

                [Op.and]: [filtrarPorFecha]
            },
            
        });

        // Guardar evento
        if(desde == 0) {
            eventBitacora(new Date, quienBusco, 26, 'CONSULTA', `SE BUSCÓ LAS CAJAS DE LA FECHA'${filtrarPorFecha}'`);
        }

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

        const cajaAbierta = await Caja.findOne({
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

        const cajaAbierta = await Caja.findOne({where: {ESTADO: '1'}});
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
            SALDO_APERTURA: saldo_apertura,
            SALDO_ACTUAL: saldo_apertura,
            ID_USUARIO: id_usuario,
            ESTADO: '1'
        }); 
        
        // // Guardar evento
        // eventBitacora(new Date, id_usuario, 26, 'NUEVO', `SE CREO UNA NUEVA CAJA CON UN SALDO INICIAL DE ${cajaAbierta.SALDO_APERTURA}`);

        emit('cajaAbierta');

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

const putCaja = async (req = request, res = response) => {
    const { id } = req.params
    const { id_usuario = "" } = req.body;
    
    try {
        
        // Actualizar db Rol
        await Caja.update({
            SALDO_CIERRE: '0',
            FECHA_CIERRE: new Date(),
            ESTADO: '0'
        }, {
            where: {
                ESTADO: '1'
            }
        })
        
        const caja = await Caja.findByPk(id);

        eventBitacora(new Date, id_usuario, 16, 'ACTUALIZACION', `DATOS ACTUALIZADOS: \`Estado caja:\`, ${caja.ESTADO} , \`Fecha de cierre: \`, ${caja.FECHA_CIERRE}`);
        
        emit('cajaCerrada');

        res.json({
            ok: true,
            msg: 'La caja se ha cerrado.'
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const deleteCaja = async (req = request, res = response) => {
    const { id } = req.params
    const { quienElimina } = req.query

    try {

        // Llamar el proveedor a borrar
        const caja = await Caja.findByPk( id );

        // Guardar evento
        eventBitacora(new Date, quienElimina, 26, 'BORRADO', `INTENTÓ ELIMINAR LA CAJA NÚMERO: ${id}`);

        res.json({
            ok: false,
            msg: `La caja no se puede eliminar`
        });

    } catch (error) {
        if( error instanceof ForeignKeyConstraintError ) {
            res.status(403).json({
                ok: false,
                msg: `La caja no se puede eliminar`
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
    getCajas,
    getCaja,
    getCajaAbierta,
    postCaja,
    putCaja,
    deleteCaja
}
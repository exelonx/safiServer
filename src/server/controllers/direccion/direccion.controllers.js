const { request, response } = require('express');
const { Op, ForeignKeyConstraintError } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const Departamento = require('../../models/direccion/departamento');
const Municipio = require('../../models/direccion/municipio');
const { eventBitacora } = require('../../helpers/event-bitacora');

// Llamar todas las preguntas paginadas
// const getDepartamento = async (req = request, res = response) => {
    
//     let { limite = 10, desde = 0, buscar = "", quienBusco = "" } = req.query

//     try {

//         // Definir el número de objetos a mostrar
//         if(!limite || limite === ""){
//             const { VALOR } = await Parametro.findOne({where: {PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
//             limite = VALOR;
//         }

//         if(desde === ""){
//             desde = 0;
//         }

//         // Paginación
//         const departamentos = await Departamento.findAll({
//             limit: parseInt(limite, 10),
//             offset: parseInt(desde, 10),
//             where: {
//                 [Op.or]: [{
//                     NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
//                 }]
//             }
//         });

//         // Contar resultados total
//         const countDepartamentos = await Departamento.count({where: {
//                 [Op.or]: [{
//                     NOMBRE: { [Op.like]: `%${buscar.toUpperCase() }%`}
//                 }]
//             }
//         });

//         // Guardar evento
//         if( buscar !== "" && desde == 0) {
//             eventBitacora(new Date, quienBusco, 15, 'CONSULTA', `SE BUSCO LOS DEPARTAMENTOS CON EL TERMINO '${buscar}'`);
//         }

//         // Respuesta
//         res.json( {limite, countDepartamentos, departamento} )

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             msg: error.message
//         })
//     }
// }

// Llamar todas las preguntas paginadas
const getDepartamentos = async (req = request, res = response) => {

    try {

        const departamento = await Departamento.findAll();
        
        // Respuesta
        res.json( {departamento} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const getDepartamento = async (req = request, res = response) => {
    const { id } = req.params;
    try {

        const departamento = await Departamento.findByPk(id);

        // Validar Existencia
        if( !departamento ){
            return res.status(404).json({
                msg: 'No existe un departamento con el id ' + id
            })
        }
        
        // Respuesta
        res.json( {departamento} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const postDepartamento = async (req = request, res = response) => {
    //body
    const { id_usuario } = req.query; 
    const { nombre = "" } = req.body;
    
    try {
 
        // Construir modelo
        const nuevoDepartamento = await Departamento.build({
            NOMBRE: nombre,
        });
        // Insertar a DB
        await nuevoDepartamento.save();   
        
        // Guardar evento
        eventBitacora(new Date, id_usuario, 24, 'NUEVO', `SE CREO UN NUEVO DEPARTAMENTO ${nuevoDepartamento.NOMBRE}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Departamento: '+ nombre + ' ha sido creada con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

// Llamar todas las preguntas paginadas
const getMunicipios = async (req = request, res = response) => {

    const { id_departamento } = req.body

    try {

        const municipio = await Municipio.findAll({where:{
            ID_DEPARTAMENTO: id_departamento
        }});

        // Respuesta
        res.json( {municipio} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const getMunicipio = async (req = request, res = response) => {
    const { id } = req.params;
    try {

        const municipio = await Municipio.findByPk(id);

        // Validar Existencia
        if( !municipio ){
            return res.status(404).json({
                msg: 'No existe un municipio con el id ' + id
            })
        }
        
        // Respuesta
        res.json( {departamento} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

const postMunicipio = async (req = request, res = response) => {
    //body
    const { id_usuario } = req.query; 
    const { nombre = "", id_departamento } = req.body;
    
    try {
        
        const departamento = await Departamento.findByPk(id_departamento);

        // Construir modelo
        const nuevoDepartamento = await Departamento.build({
            NOMBRE: nombre,
        },{
            where:{ID_DEPARTAMENTO: departamento}
        });
        // Insertar a DB
        await nuevoDepartamento.save();   
        
        // Guardar evento
        eventBitacora(new Date, id_usuario, 25, 'NUEVO', `SE CREO UN NUEVO DEPARTAMENTO ${nuevoDepartamento.NOMBRE}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Departamento: '+ nombre + ' ha sido creada con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putDepartamento = async (req = request, res = response) => {
    const { id } = req.params
    const { id_usuario = "" } = req.query;
    const { nombre = "" } = req.body;

    try {

        const departamento = await Departamento.findByPk(id);
        
        // Si llega sin cambios
        if(!((departamento.NOMBRE == nombre || nombre === ""))) {

                eventBitacora(new Date, id_usuario, 24, 'ACTUALIZACION', `DEPARTAMENTO ${departamento.NOMBRE}, ACTUALIZADO A: ${nombre !== "" && departamento.NOMBRE != nombre ? `${nombre_catalogo}` : ""}`);

        }

        // Actualizar db Rol
        await Departamento.update({
            NOMBRE: nombre !== "" ? nombre : Departamento.NOMBRE,
        }, {
            where: {
                ID: id
            }
        })

        res.json({
            ok: true,
            msg: 'Unidad: '+ departamento.NOMBRE + ' ha sido actualizado con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

module.exports = {
    getDepartamentos,
    getDepartamento,
    getMunicipios,
    getMunicipio,
    postDepartamento,
    postMunicipio,
    putDepartamento
}
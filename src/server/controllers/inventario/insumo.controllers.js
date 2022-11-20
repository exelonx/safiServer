const { request, response } = require('express');
const { Op, ForeignKeyConstraintError, DATE } = require('sequelize');

const Parametro = require("../../models/seguridad/parametro");
const { eventBitacora } = require('../../helpers/event-bitacora');
const ViewInsumo = require('../../models/inventario/sql-vista/view-insumo');
const Insumo = require('../../models/inventario/insumo');
const Inventario = require('../../models/inventario/inventario');


const getInsumos = async (req = request, res = response) => {

    let { limite = 10, desde = 0, buscar = "", quienBusco = "" } = req.query

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
        const insumos = await ViewInsumo.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    UNIDAD_MEDIDA: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Contar resultados total
        const countInsumos = await ViewInsumo.count({
            where: {
                [Op.or]: [{
                    NOMBRE: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    UNIDAD_MEDIDA: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    MODIFICACION_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }, {
                    CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` }
                }]
            }
        });

        // Guardar evento
        if (buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 21, 'CONSULTA', `SE BUSCÓ LOS INSUMOS CON EL TÉRMINO '${buscar}'`);
        }

        // Respuesta
        res.json({ limite, countInsumos, insumos })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo insumo
const getInsumo = async (req = request, res = response) => {
    const { id_insumo } = req.params;
  
    try {
      const insumo = await ViewInsumo.findByPk(id_insumo);
  
      // Validar Existencia
      if (!insumo) {
        return res.status(404).json({
          msg: "No existe un insumo con el id " + id_insumo,
        });
      }
  
      res.json({ insumo });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: error.message,
      });
    }
};

const postInsumo = async (req = request, res = response) => {
    //body
    const { nombre = "", id_unidad = "", cantidad_maxima = "", cantidad_minima = "", creado_por = "" } = req.body;
    
    try {
 
        // Construir modelo
        const nuevoInsumo = await Insumo.create({
            NOMBRE: nombre,
            ID_UNIDAD: id_unidad,
            CANTIDAD_MAXIMA: cantidad_maxima,
            CANTIDAD_MINIMA: cantidad_minima,
            CREADO_POR: creado_por,
            MODIFICADO_POR: creado_por
        });
        
        // Guardar evento
        eventBitacora(new Date, creado_por, 21, 'NUEVO', `SE CREO EL INSUMO ${nuevoInsumo.NOMBRE}`);

        // Responder
        res.json( {
            ok: true,
            msg: 'Insumo: '+ nombre + ' ha sido creado con éxito'
        } );

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
};

const putInsumo = async (req = request, res = response) => {
    const { id_insumo } = req.params
    const { nombre, id_unidad = "", cantidad_maxima = "", cantidad_minima = "", quienModifico = "" } = req.body;

    try {

        const insumoAnterior = await Insumo.findByPk(id_insumo)

        // Actualizar db Pregunta
        await Insumo.update({
            NOMBRE: nombre,
            ID_UNIDAD: id_unidad,
            CANTIDAD_MAXIMA: cantidad_maxima,
            CANTIDAD_MINIMA: cantidad_minima,
            MODIFICACION_POR: quienModifico,
            FECHA_MODIFICACION: new Date()
        }, {
            where: {
                id: id_insumo
            }
        })

         // Si llega sin cambios
        if(!(insumoAnterior.NOMBRE == nombre || nombre === "")
        && (insumoAnterior.ID_UNIDAD == id_unidad || id_unidad === "") 
        && (insumoAnterior.CANTIDAD_MAXIMA == cantidad_maxima || cantidad_maxima === "")
        && (insumoAnterior.CANTIDAD_MINIMA == cantidad_minima || cantidad_minima === ""))
         {
            eventBitacora(new Date, quienModifico, 21, 'ACTUALIZACION', `EL INSUMO '${insumoAnterior.NOMBRE}' HA SIDO ACTUALIZADO CON ÉXITO`);
        }


        res.json({ 
            ok: true, 
            msg: 'Insumo actualizado con éxito'});

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
    
};

const deleteInsumo = async (req = request, res = response) => {
    const { id_insumo } = req.params
    const { quienElimina } = req.query

    try {

        // Llamar el insumo a borrar
        const insumo = await Insumo.findByPk( id_insumo );

        // Extraer el nombre del insumo
        const { NOMBRE } = insumo;

        const inventario = await Inventario.findOne({
            where: { ID_INSUMO: id_insumo }
        })

        //Si el inventario tiene existencia no va dejar borrarlo
        if (inventario.EXISTENCIA == 0.00) {
            await inventario.destroy()
        }
        
        // Borrar insumo
        await insumo.destroy();

        // Guardar evento
        eventBitacora(new Date, quienElimina, 21, 'BORRADO', `SE ELIMINO EL INSUMO ${NOMBRE}`);

        res.json({
            ok: true,
            msg: `El insumo: ${NOMBRE} ha sido eliminado`
        });

    } catch (error) {
        if( error instanceof ForeignKeyConstraintError ) {
            res.status(403).json({
                ok: false,
                msg: `El insumo no puede ser eliminado`
            })
        } else {

            console.log(error);
            res.status(500).json({
                msg: error.message
            })

        }
    }  
};


module.exports = {
    getInsumos,
    getInsumo,
    postInsumo,
    putInsumo,
    deleteInsumo
}
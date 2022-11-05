const { response, request } = require("express");
const Unidad = require("../models/inventario/unidad");

const existeUnidad = async(req = request, res = response, next) => {

    const { unidad_medida } = req.body;
    // Validar que no exista rol repetido
    const nombreRepetido = await Unidad.findOne({
        where: {
            UNIDAD_MEDIDA: unidad_medida
        }
    })

    if ( nombreRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `La unidad: ${ unidad_medida }, ya existe`
        }) 
    }

    next()
}

const noExisteUnidadPorId = async(req = request, res = response, next) => {

    const { id } = req.params;
    // Validar que no exista rol repetido
    const unidadnoExistente = await Unidad.findByPk( id )

    if ( !unidadnoExistente ) {
        return res.status(400).json({
            ok: false,
            msg: `La unidad: ${ id }, no existe`
        }) 
    }

    next()

}

module.exports = {
    existeUnidad,
    noExisteUnidadPorId
}
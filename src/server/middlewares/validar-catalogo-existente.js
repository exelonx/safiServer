const { response, request } = require("express");
const Catalogo = require("../models/catalogo-ventas/catalogo");

const existeCatalogo = async(req = request, res = response, next) => {

    const { nombre_catalogo } = req.body;
    // Validar que no exista rol repetido
    const nombreRepetido = await Catalogo.findOne({
        where: {
            NOMBRE_CATALOGO: nombre_catalogo
        }
    })

    if ( nombreRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El catálogo: ${ nombre_catalogo }, ya existe`
        }) 
    }

    next()
}

const noExisteCatalogoPorId = async(req = request, res = response, next) => {

    const { id } = req.params;
    // Validar que no exista rol repetido
    const catalogoNoExistente = await Catalogo.findByPk( id )

    if ( !catalogoNoExistente ) {
        return res.status(400).json({
            ok: false,
            msg: `El catálogo: ${ id }, no existe`
        }) 
    }

    next()

}

module.exports = {
    existeCatalogo,
    noExisteCatalogoPorId
}
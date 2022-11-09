const { response, request } = require("express");
const Producto = require("../models/catalogo-ventas/producto");

const existeProducto = async(req = request, res = response, next) => {

    const { nombre } = req.body;
    // Validar que no exista producto repetido
    const nombreRepetido = await Producto.findOne({
        where: {
            NOMBRE: nombre
        }
    })

    if ( nombreRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El producto: ${ nombre }, ya existe`
        }) 
    }

    next()
}

const noExisteProductoPorId = async(req = request, res = response, next) => {

    const { id } = req.params;
    // Validar que no exista producto repetido
    const productoNoExistente = await Producto.findByPk( id )

    if ( !productoNoExistente ) {
        return res.status(400).json({
            ok: false,
            msg: `El producto: ${ id }, no existe`
        }) 
    }

    next()

}

module.exports = {
    existeProducto,
    noExisteProductoPorId
}
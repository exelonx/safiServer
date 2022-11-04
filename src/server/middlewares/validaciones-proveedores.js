const { response, request } = require("express");

const Proveedor = require("../models/inventario/proveedor");

const noExisteProveedor = async( req = request, res = response, next ) => {

    const { id } = req.body;

    // Verificar el usuario
    let user = await Proveedor.findByPk( id );

    if ( !user ) {
        return res.status(400).json({
            ok: false,
            msg: 'No existe un usuario con el ID: '+id
        })
    }

    next()
}

const validarEspaciosProveedor = ( req = request, res = response, next ) => {

    const { nombre = "" } = req.body;

    if ( nombre.includes('  ') ) {
        return res.status(400).json({
            ok: false,
            msg: 'No se permite más de 1 espacio en blanco entre palabras en el nombre'
        })
    }

    next()
}

module.exports = {
    noExisteProveedor,
    validarEspaciosProveedor
}
const { response, request } = require("express");
const { Op } = require("sequelize");
const Proveedor = require("../models/inventario/proveedor");

const existeProveedor = async(req = request, res = response, next) => {

    const { nombre } = req.body;
    // Validar que no exista rol repetido
    const nombreRepetido = await Proveedor.findOne({
        where: {
            NOMBRE: nombre
        }
    })

    if ( nombreRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El proveedor: ${ nombre }, ya existe`
        }) 
    }

    next()
}

const existeProveedorPut = async(req = request, res = response, next) => {

    const { id } = req.params
    const { nombre } = req.body;
    // Validar que no exista el proveedor repetido
    const nombreRepetido = await Proveedor.findOne({
        where: {
            NOMBRE: nombre,
            [Op.not] : [
                {ID: id}
            ]
        }
    })

    if ( nombreRepetido ) {
        return res.status(400).json({
            ok: false,
            msg: `El proveedor: ${ nombre }, ya existe`
        }) 
    }

    next()
}

const noExisteProveedorPorId = async(req = request, res = response, next) => {

    const { id } = req.params;
    // Validar que no exista rol repetido
    const proveedorNoExistente = await Proveedor.findByPk( id )

    if ( !proveedorNoExistente ) {
        return res.status(400).json({
            ok: false,
            msg: `El proveedor: ${ id }, no existe`
        }) 
    }

    next()

}

module.exports = {
    existeProveedor,
    noExisteProveedorPorId,
    existeProveedorPut
}
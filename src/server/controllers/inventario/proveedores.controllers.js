const { request, response } = require('express');

// Llamar todas las preguntas paginadas
const getProveedores = async (req = request, res = response) => {
    
    let { limite = 10, desde = 0 } = req.query
    let { mmm } = req.body

    try {

        res.json('hola :) mi limite es: '+limite+mmm)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

module.exports = {
    getProveedores
}

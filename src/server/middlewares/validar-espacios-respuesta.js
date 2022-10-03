const { response, request } = require("express");

const validarEspaciosRespuesta = (req = request, res = response, next) => {

    const { respuesta = ""} = req.body;

    // Validar que no exista espacio en blanco
    if ( respuesta.includes('  ')) {
        return res.status(400).json({
            ok: false,
            msg: 'Debe incluir un espacio por palabra.'
        })
    }

    //TODO OK!
    next();

}

module.exports = {
    validarEspaciosRespuesta
}
const { response, request } = require("express")


const validarExisteImagen = (req, res = response, next) =>{
console.log(req.file)

    if (!req.file) {
        return res.status(400).json({
            msg: 'No hay imagen'
        });
    }
    
    next();
    
}

const validarFormatoImagen = (req = request, res = response, next) => {

    const imagenUsuario = req.file;

    const nombreCortado = imagenUsuario.originalname.split('.');

    const extension = nombreCortado[nombreCortado.length - 1];

    const extensionesValidas = ['png', 'jpg', 'jpeg'];

    //Validar la extension
    if (!extensionesValidas.includes(extension)) {
        return res.json({msg: `Formatos permitidos: ${extensionesValidas}`});
    }

    next();
}

module.exports = {
    validarExisteImagen,
    validarFormatoImagen
}
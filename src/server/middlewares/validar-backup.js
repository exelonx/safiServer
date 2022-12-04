const { response } = require("express")


const validarBackup = (req, res = response, next) =>{

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.backup) {
        console.log(req.files)
        return res.status(400).json({
            msg: 'No hay backup que subir'
        });
    }

    const {backup} = req.files;
    const nombreCortado = backup.name.split('.');
    const extension = nombreCortado[nombreCortado.length - 1];

    const extensionesValidas = 'sql'
    if(!extensionesValidas.includes(extension)){
        return res.status(400).json({
            ok: false,
            msg: `La extensión ${extension} no es permitida`
        })
    }
    
    next();
    
}

module.exports = {
    validarBackup
}
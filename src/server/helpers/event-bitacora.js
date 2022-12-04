const BitacoraSistema = require("../models/seguridad/bitacora")


const eventBitacora = (fecha, id_usuario, id_objeto, accion, descripcion) => {
    try {
        
        // Construir registro
        const evento = BitacoraSistema.build({
            FECHA:          fecha,
            ID_USUARIO:     id_usuario,
            ID_OBJETO:      id_objeto,
            ACCION:         accion,
            DESCRIPCION:    descripcion
        })
    
        // Guardar
        evento.save();
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    eventBitacora
}
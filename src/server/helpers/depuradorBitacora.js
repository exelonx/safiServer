const BitacoraSistema = require("../models/seguridad/bitacora");
const Parametro = require("../models/seguridad/parametro");
const modificarDias = require("./manipulacion-fechas");

const depurarBitacora = async () => {
    
    // Traer registros
    const eventos = await BitacoraSistema.findAll();

    // Validar que exista registros
    if(eventos.length === 0) {

        return console.log('No se encontraron registros para purgar');

    } else {

        // Existen registros
        let registrosBorrados = 0;

        for await ( const evento of eventos ){

            // Traer el día de vigencia de los registros de bitácora
            const vigencia = await Parametro.findOne({where: { PARAMETRO: 'DEPURACION_BITACORA' }});
    
            // Calcular fecha de caducidad
            let fechaActual = new Date();
            let fechaEvento = new Date(evento.FECHA);
            let FechaCaducidad = modificarDias(fechaEvento, parseInt( vigencia.VALOR,10));
            
            // Evaluar caducidad
            if( FechaCaducidad <= fechaActual) {

                // Purgar eventos caducados    
                await evento.destroy();
                registrosBorrados++

            }
        }

        // Mostrar ttodos los registros purgados
        console.log('Se han eliminado un total de '+registrosBorrados+" registros de la tabla bitácora");

    }

}

module.exports = {
    depurarBitacora
}
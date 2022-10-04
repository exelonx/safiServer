

function modificarDias (fecha, dias){
    
    fecha.setDate(fecha.getDate() + dias);

    return fecha;
}

module.exports = modificarDias;




function modificarDias (fecha, dias){
    fecha.setDate(fecha.getDay() + dias);

    return fecha;
}

module.exports = modificarDias;


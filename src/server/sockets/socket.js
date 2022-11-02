

const desconectar = ( cliente ) => {

    cliente.on('disconnect', () => {
        console.log('Cliente desconectado');
    })

}

const mensaje = ( cliente, io ) => {

    cliente.on('mensaje', (payload) => {
        console.log(payload)

        io.emit('tester', payload+' desde el server')
    })

}

module.exports = {
    desconectar,
    mensaje
}
const jwt = require('jsonwebtoken')

const generarJWT = ( uid, rol ) => {

    const payload = { uid, rol };
    
    return new Promise((resolve, reject) => {
        jwt.sign( payload, process.env.SEMILLA_SECRETA_JWT, {
            expiresIn: '24h'
        }, (err, token) => {
    
            if ( err ) {
                // TODO MAL
                console.log(err);
                reject(err);
            } else {
                // TODO BIEN
                resolve(token);
            }
    
        })
    })

}

const recuperarContraPorJWT = () => {
    // TODO: Generar un token con duración máxima
}

module.exports = {
    generarJWT,
    recuperarContraPorJWT
}
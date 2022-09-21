const jwt = require('jsonwebtoken')

const generarJWT = ( uid, duracion, semilla ) => {

    const payload = { uid };
    
    return new Promise((resolve, reject) => {
        jwt.sign( payload, semilla, {
            expiresIn: duracion
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


module.exports = {
    generarJWT,
}
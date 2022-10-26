const path = require('path')
const fs = require('fs');

const { response, request } = require('express');


const Usuario = require('../../models/seguridad/usuario')
const ViewUsuario = require('../../models/seguridad/sql-vistas/view_usuario');

const subirImagen = async (req = request, res = response) => {
    const { id_usuario } = req.params;
    const { imagenUsuario } = req.files;
    let { quienModifico } = req.body

    try {
        const usuario = await Usuario.findByPk(id_usuario)

        //Buscar usuario
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'No existe este usuario'
            })
        }

        //Concertir la imagen a base64
        const imagenNombre = imagenUsuario.name;
        const imagen = new Buffer(imagenNombre).toString('base64');

        console.log(imagen);
        // Actualizar Imagen de usuario
        await usuario.update({
            IMAGEN: imagen,
            MODIFICADO_POR: quienModifico
        },{
            where: {
                ID_USUARIO: id_usuario
            }
        })

        return res.json({
            ok: true,
            msg: 'Imagen agregada con éxito'
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}

const actualizarImagen = async (req, res = response) => {

    const { id_usuario } = req.params;
    let { imagenUsuario } = req.files;
    let { quienModifico } = req.body
    const usuario = await Usuario.findByPk(id_usuario);

    if (!usuario) {
        return res.status(400).json({
            ok: false,
            msg: 'No existe un usuario con el ID: ' + id_usuario
        })
    }

    //Concertir la imagen a base64
    const imagenNombre = imagenUsuario.name;
    let imagen = new Buffer(imagenNombre).toString('base64');

    // Actualizar Imagen de usuario
    await Usuario.update({
        IMAGEN: imagen,
        MODIFICADO_POR: quienModifico
    }, {
        where: {
            ID_USUARIO: id_usuario
        }
    });

    return res.json({
        ok: true,
        msg: 'Imagen actualizada con éxito'
    })
}

//Aún esta verdesito esta API :v
const mostrarImagen = async (req, res = response) => {
    
    const { id_usuario } = req.params;
    const usuario = await ViewUsuario.findByPk(id_usuario);

    let foto = usuario.IMAGEN;

    console.log(foto);

    // const user = await ViewUsuario.findByPk(id_usuario);
    // console.log(user.ID_USUARIO);
    // if (!user.ID_USUARIO) {
    //     return res.status(400).json({
    //         ok: false,
    //         msg: 'No existe un usuario con el ID: ' + id_usuario
    //     })
    // }

    // //Limpiar imagenes
    // if (user.IMAGEN) {
    //     const pathImagen = path.join(__dirname, '../../../server/uploads/', user.IMAGEN);
    //     if (fs.existsSync(pathImagen)) {
    //         return res.sendFile(pathImagen);
    //     }
    // }

    // const pathImage = path.join(__dirname, '../../../assets/svg/no-image.jpg');
    // res.sendFile(pathImage);
}

module.exports = {
    subirImagen,
    actualizarImagen,
    mostrarImagen
}
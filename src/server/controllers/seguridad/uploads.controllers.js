const path = require('path')
const fs = require('fs');

const { response } = require('express');
const { subirArchivo } = require('../../helpers/subir-archivo');

const Usuario = require('../../models/seguridad/usuario')
const ViewUsuario = require('../../models/seguridad/sql-vistas/view_usuario');

const actualizarImagen = async (req, res = response) => {
    
    const { id_usuario } = req.params;
    let usuario = await Usuario.findByPk(id_usuario);
    
    if (!usuario) {
        return res.status(400).json({
            ok: false,
            msg: 'No existe un usuario con el ID: ' + id_usuario
        })
    }

    //Limpiar imagenes
    if(usuario.IMAGEN){
        //Hay que borrar la imagen del servidor
        const pathImagen = path.join( __dirname, '../../uploads', usuario.IMAGEN);
        if(fs.existsSync(pathImagen)){
            fs.unlinkSync(pathImagen);
        }
    }

    //Imagenes
    const nombre = await subirArchivo(req.files, undefined);
    usuario.IMAGEN = nombre;

    await usuario.save();

    res.json(usuario)
}

const mostrarImagen = async(req, res = response) => {
    
    const { id_usuario } = req.params;
    const usuario = await ViewUsuario.findAll({
        where:{ID_USUARIO: id_usuario},
        attributes: {include:['IMAGEN']}
    });

    const user = await ViewUsuario.findByPk(id_usuario);
    console.log(user.ID_USUARIO);
    if (!user.ID_USUARIO) {
        return res.status(400).json({
            ok: false,
            msg: 'No existe un usuario con el ID: ' + id_usuario
        })
    }

    //Limpiar imagenes
    if(user.IMAGEN){
        const pathImagen = path.join( __dirname, '../../../server/uploads/', user.IMAGEN);
        if(fs.existsSync(pathImagen)){
            return res.sendFile(pathImagen);
        }
    }

     const pathImage = path.join( __dirname, '../../../assets/svg/no-image.jpg');
     res.sendFile(pathImage);
}

module.exports = {
    cargarArchivo,
    actualizarImagen,
    mostrarImagen
}
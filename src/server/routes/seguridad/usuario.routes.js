const { Router } = require('express');
const { check, body } = require("express-validator");
const multer = require('multer');
const upload = multer({storage:multer.memoryStorage()});

const { validarCampos,
        validarLongitudDBContra,
        validarContraseña,
        existeUsuario,
        validarEspacio,
        existeUsuarioUpdated,
        validarEspaciosUsuario, 
        validarContrasenaActual} = require('../../middlewares');
    
const { registrar,
        getUsuarios,
        getUsuario,
        bloquearUsuario,
        putContrasena,
        putUsuario,
        contrasenaGenerador,
        cambioContrasenaPerfil,
        cambioContrasenaMantenimiento,
        crearUsuarioMantenimiento,
        reActivarUsuario} = require('../../controllers/seguridad/usuario.controllers');

const { emailExistente,
        emailExistenteUpdate } = require('../../helpers/db-validators');
const { actualizarImagen, mostrarImagen, subirImagen } = require('../../controllers/seguridad/uploads.controllers');
const { validarExisteImagen, validarFormatoImagen } = require('../../middlewares/validar-imagen');

const router = Router();

// APIs

router.post('/registro', [
    //Validaciones de usuario
    check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    check('usuario', 'El usuario debe estar en mayúscula').isUppercase(),
    check('usuario', 'El máximo de carácteres son de 15').isLength({max: 15}),
    check('usuario', 'No se permite espacios en blanco en el usuario').custom(validarEspacio),
    // Validaciones de nombre de usuario
    check('nombre_usuario', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('nombre_usuario', 'El nombre de usuario debe estar solo en mayúscula').isUppercase(),
    validarEspaciosUsuario,
    // validaciones de correo
    check('correo', 'El correo es obligatorio').not().isEmpty(),
    check('correo', 'El correo no es válido').isEmail(),
    check('correo').custom(emailExistente),
    // Validar contraseña
    existeUsuario,
    validarLongitudDBContra,
    validarContraseña,
    validarCampos
], registrar)

router.post('/nuevo-usuario', [
    //Validaciones de usuario
    check('usuario', 'El usuario es obligatorio').not().isEmpty(),
    check('usuario', 'El usuario debe estar en mayúscula').isUppercase(),
    check('usuario', 'El máximo de carácteres son de 15').isLength({max: 15}),
    check('usuario', 'No se permite espacios en blanco en el usuario').custom(validarEspacio),
    check('usuario', 'El usuario solo puede contener letras').isAlpha('es-ES'),
    // Validaciones de nombre de usuario
    check('nombre_usuario', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('nombre_usuario', 'El nombre de usuario debe estar en mayúscula').isUppercase(),
    check('nombre_usuario', 'El nombre de usuario debe ser solo letras').isAlpha('es-ES', {ignore: ' '}),
    validarEspaciosUsuario,
    // validaciones de correo
    check('correo', 'El correo es obligatorio').not().isEmpty(),
    check('correo', 'El correo no es válido').isEmail(),
    check('correo').custom(emailExistente),
    check('id_rol', 'El rol es obligatorio').not().isEmpty(),
    // Validar contraseña
    existeUsuario,
    validarLongitudDBContra,
    validarContraseña,
    validarCampos
], crearUsuarioMantenimiento)

router.get('/', getUsuarios);

router.get('/:id_usuario', getUsuario)

router.put('/bloquear/:id_usuario', bloquearUsuario)

router.put('/cambiar-contrasena/:id_usuario', [
    // Validar contraseña
    validarLongitudDBContra,
    validarContraseña,
    check('confirmContrasena', "La confirmación es obligatoria").not().isEmpty(),
    check('quienModifico', "El usuario quien modifico es obligatorio").not().isEmpty(),
    validarCampos
], putContrasena)

router.put('/actualizar/:id_usuario', [
        //Validaciones de usuario
        check('usuario', 'El usuario debe estar en mayúscula').isUppercase(),
        check('usuario', 'El máximo de carácteres son de 15').isLength({max: 15}),
        check('usuario', 'No se permite espacios en blanco en el usuario').custom(validarEspacio),
        // Validaciones de nombre de usuario
        check('nombre_usuario', 'El nombre de usuario debe estar en mayúscula').isUppercase(),
        validarEspaciosUsuario,
        check('nombre_usuario', 'El nombre de usuario debe ser letras').if(body('nombre_usuario').exists()).if(body('nombre_usuario').not().equals('')).isAlpha('es-ES', {ignore: ' '}),
        // validaciones de correo
        check('correo', 'El correo no es válido').if(body('correo').exists()).if(body('correo').not().equals('')).isEmail(),
        emailExistenteUpdate,
        // Validar contraseña
        existeUsuarioUpdated,
        validarCampos
], putUsuario)

// router.get('/imagen-perfil/:id_usuario', mostrarImagen)

router.post('/subir-imagen/:id_usuario', upload.single("imagenUsuario"), [
    validarExisteImagen,
    validarFormatoImagen
],subirImagen)

router.put('/actualizar-imagen/:id_usuario', upload.single("imagenUsuario"), [
    validarExisteImagen,
    validarFormatoImagen
], actualizarImagen);

router.put('/cambiar-contrasena/perfil/:id_usuario', [
    // Validar contraseña
    check('confirmContrasena', "La confirmación es obligatoria").not().isEmpty(),
    validarContrasenaActual,
    validarLongitudDBContra,
    validarContraseña,
    validarCampos
], cambioContrasenaPerfil)

router.get('/generador/password', contrasenaGenerador)

router.put('/cambiar-contrasena/mantenimiento/:id_usuario', [
    // Validar contraseña
    check('contrasena', 'La contraseña es obligatoria').not().isEmpty(),
    validarLongitudDBContra,
    validarContraseña,
    validarCampos
], cambioContrasenaMantenimiento)

router.put('/activar/:id', reActivarUsuario);

module.exports = router;
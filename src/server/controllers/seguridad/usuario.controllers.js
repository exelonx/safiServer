const { response, request } = require("express");
const { Op, where } = require("sequelize");
const bcrypt = require('bcryptjs');
const generator = require('generate-password');

const Usuario = require("../../models/seguridad/usuario");
const Parametro = require("../../models/seguridad/parametro");
const ViewUsuarios = require("../../models/seguridad/sql-vistas/view_usuario");
const Usuarios = require("../../models/seguridad/usuario");
const HistorialContrasena = require('../../models/seguridad/historial-contrena');
const PreguntaUsuario = require("../../models/seguridad/pregunta-usuario");
const Roles = require("../../models/seguridad/rol");

const modificarDias = require("../../helpers/manipulacion-fechas");
const { crearTransporteSMTP } = require("../../helpers/nodemailer");
const { eventBitacora } = require("../../helpers/event-bitacora");


const registrar = async(req = request, res = response) => {

    const { usuario = "", nombre_usuario = "", contrasena = "", confirmContrasena = "", correo = "" } = req.body;

    try {

        // Validar que hagan match la confirmación de contraseña
        if( contrasena !== confirmContrasena ) {
            return res.status(401).json({
                ok: false,
                msg: `Contraseña no coincide`
            })
        }

        // Traer días de vigencia de parametros
        const diasVigencias = await Parametro.findOne({
            where:{
                PARAMETRO: 'ADMIN_DIAS_VIGENCIA'
            }
        });

        // Calcular fecha de vencimiento
        const fechaActual = new Date();
        const fechaVencimiento = (modificarDias(fechaActual, parseInt(diasVigencias.VALOR,10)));  

        // Cargar el id del rol default (Para no Hardcodear)
        const idRol = await Roles.findOne({where: {
            ROL: 'DEFAULT'
        }})

        // Crear usuario con el modelo
        DBusuario = await Usuario.build({
            USUARIO: usuario,
            NOMBRE_USUARIO: nombre_usuario,
            CONTRASENA :contrasena,
            CORREO_ELECTRONICO: correo,
            FECHA_VENCIMIENTO: fechaVencimiento,
            ID_ROL: idRol.ID_ROL
        })

        // Hashear contraseña
        const salt = bcrypt.genSaltSync();
        DBusuario.CONTRASENA = bcrypt.hashSync(contrasena, salt);

        // Crear usuario de DB
        await DBusuario.save()

        //''''''''''''''''''''''' Guardar contraseña en historial ''''''''''''''''''''''''''

        // Llamar al usuario recien creado
        const usuarioCreado = await Usuario.findOne({where:{USUARIO: usuario}});

        historialContrasena = await HistorialContrasena.build({
            ID_USUARIO: usuarioCreado.ID_USUARIO,
            CONTRASENA: DBusuario.CONTRASENA
        })

        historialContrasena.save();

        // Traer ID del usuario creado
        const user = await Usuario.findOne({where:{USUARIO: usuario}});
        //Actualizar quién lo modifico y creo
        await Usuario.update({
            CREADO_POR: user.ID_USUARIO,
            MODIFICADO_POR: user.ID_USUARIO
        },{
            where:{
                ID_USUARIO: user.ID_USUARIO
            }
        })

        // ------------------ Mandar Correos ----------------------

        // Para enviar correos
        const transporte = await crearTransporteSMTP();

        // Parametros del mailer
        const correoSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_CORREO' }});
        const correoAdmin = await Parametro.findOne({where: { PARAMETRO: 'ADMIN_CORREO'}});
        const nombreEmpresaSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_NOMBRE_EMPRESA' }});

        // Al usuario
        transporte.sendMail({
            from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR}>`, // Datos de emisor
	    	to: correo, // Receptor
	    	subject: "¡Cuenta creada! 🍔👌", // Asunto
	    	html: `<b>Bienvenido a Dr. Buger, su cuenta ha sido creada
            <hr>Usuario: ${usuario} 
            <br>Contraseña: ${contrasena} 
            <hr>contacte con el administrador para activar su cuenta</b>`
	    }, (err) => {
            if(err) { console.log( err ) };
        });

        // Al administrador
        transporte.sendMail({
            from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR}>`, // Datos de emisor
	    	to: correoAdmin.VALOR, // Receptor
	    	subject: "¡Nuevo usuario creado! 🍔👌", // Asunto
	    	html: `
            <b>Un nuevo usuario ha sido creado</b><br>
            <b>Usuario: <strong>${usuario}</strong></b><br>
            <b>Nombre del usuario: <strong>${nombre_usuario}</strong></b>
            <br>
            `
        }, (err) => {
            if(err) { console.log( err ) };
        })

        // Guardar evento
        eventBitacora(new Date, user.ID_USUARIO, 4, 'NUEVO', 'SE REGISTRO EL USUARIO '+usuario);

        // Generar respuesta exitosa
        return res.status(201).json({
            ok: true,
            msg: 'Registro éxitoso'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
}

const getUsuarios = async(req = request, res = response) => {
    let { limite, desde = 0, buscar = "", quienBusco, mostrarInactivos = false} = req.query

    try {
        // Definir el número de objetos a mostrar
        if(!limite || limite === ""){
            const { VALOR } = await Parametro.findOne({where: {PARAMETRO: 'ADMIN_NUM_REGISTROS'}})
            limite = VALOR;
        }

        if(desde === ""){
            desde = 0;
        }


        // Paginación
        const usuarios = await ViewUsuarios.findAll({
            limit: parseInt(limite, 10),
            offset: parseInt(desde, 10),
            where: {
                // WHERE PREGUNTA LIKE %${BUSCAR}% OR LIKE %${BUSCAR}%
                [Op.or]: [{
                    USUARIO: { [Op.like]: `%${buscar.toUpperCase() }%`}
                }, {
                    NOMBRE_USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    ESTADO_USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    ROL: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }, {
                    CORREO_ELECTRONICO: { [Op.like]: `%${buscar.toUpperCase()}%`}
                }],
                [Op.not]: [{
                    // Si se recibe true mostrara los inactivos
                    ESTADO_USUARIO: `${mostrarInactivos === 'false' ? 'INACTIVO' : ''}` 
                }]
            }
        });
        
        // Contar resultados total
        const countUsuarios = await ViewUsuarios.count({where: {
            // WHERE COLUMNA1 LIKE %${BUSCAR}% OR COLUMNA2 LIKE %${BUSCAR}%
            [Op.or]: [{
                USUARIO: { [Op.like]: `%${buscar.toUpperCase() }%`}
            }, {
                NOMBRE_USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                ESTADO_USUARIO: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                ROL: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }, {
                CORREO_ELECTRONICO: { [Op.like]: `%${buscar.toUpperCase()}%`}
            }],
            [Op.not]: [{
                // Si se recibe true mostrara los inactivos
                ESTADO_USUARIO: `${mostrarInactivos === 'false' ? 'INACTIVO' : ''}` 
            }]
        }})

        // Guardar evento
        if( buscar !== "" && desde == 0) {
            eventBitacora(new Date, quienBusco, 2, 'CONSULTA', `SE BUSCO LOS USUARIOS CON EL TERMINO '${buscar}'`);
        }

        // Respuesta
        res.json( {limite, countUsuarios, usuarios} )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }
}

// Para llamar 1 solo usuario
const getUsuario = async (req = request, res = response) => {
     
    const { id_usuario } = req.params

    try {
        
        const usuario = await ViewUsuarios.findByPk( id_usuario );

        // Validar Existencia
        if( !usuario ){
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        res.json( usuario )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: error.message
        })
    }

}


// Banear usuario
const bloquearUsuario = async (req = request, res = response) => {

    const { quienModifico } = req.body 
    const { id_usuario  } = req.params

    try {
        
        const usuario = await Usuarios.findByPk( id_usuario );

        // Validar Existencia
        if( !usuario ){
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        if( usuario.USUARIO === 'ROOT' ) {
            res.status(401).json({
                ok: false,
                msg: 'El usuario root no puede ser eliminado'
            })
        }

        // Actualizar db Pregunta
        await usuario.update({
            ESTADO_USUARIO: 'INACTIVO',
            MODIFICADO_POR: quienModifico
        }, {
            where: {
                ID_USUARIO: id_usuario
            }
        })

        // ------------------ Mandar Correos ----------------------

        // Para enviar correos
        const transporte = await crearTransporteSMTP();

        // Parametros del mailer
        const correoSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_CORREO' }});
        const nombreEmpresaSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_NOMBRE_EMPRESA' }});

        // Notificar Al usuario por correo
        transporte.sendMail({
            from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR.VALOR}>`, // Datos de emisor
	    	to: usuario.CORREO_ELECTRONICO, // Receptor
	    	subject: "Cuenta desactivada 🍔", // Asunto
	    	html: `<b>Su cuenta ha sido desactivada por el administrador</b><br>`
	    }, (err) => {
            if(err) { console.log( err ) };
        });

        eventBitacora(new Date, usuario.ID_USUARIO, 2, 'ELIMINACIÓN', `USUARIO ${usuario.USUARIO} HA SIDO INACTIVADO`);

        res.json( {
            ok: true,
            msg: `Usuario ${usuario.USUARIO} ha sido inactivado`
        } )

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.msg
        })
    }

}

const putUsuario = async (req = request, res = response) => {
    const { id_usuario } = req.params
    const { nombre_usuario = "", correo = "", id_rol = "", estado = "", fechaVencimiento = "", quienModifico, idPantalla } = req.body;

    try {

        // Validar existencia
        const usuarioModelo = await Usuarios.findByPk( id_usuario );
        if( !usuarioModelo ){
            eventBitacora(new Date, quienModifico, idPantalla, 'ACTUALIZACION', 'ACTUALIZACION DE DATOS SIN EXITO');
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        // Evitar modificaciones del nombre, rol y estado del super usuario
        if(usuarioModelo.USUARIO === 'ROOT' ) {
            
            if(nombre_usuario !== "") {

                return res.status(401).json({
                    ok: false,
                    msg: 'No se puede modificar el nombre del super usuario'
                })

            }

            if(id_rol !== "") {
                return res.status(401).json({
                    ok: false,
                    msg: 'No se puede modificar el rol del super usuario'
                })
            }

            if(estado !== "") {
                return res.status(401).json({
                    ok: false,
                    msg: 'No se puede modificar el estado del super usuario'
                })
            }

        }

        // Si llega sin cambios
        if(!((usuarioModelo.NOMBRE_USUARIO == nombre_usuario || nombre_usuario === "") 
            && (usuarioModelo.ESTADO_USUARIO == estado || estado === "") 
            && (usuarioModelo.ID_ROL == id_rol || id_rol === "") 
            && (usuarioModelo.CORREO_ELECTRONICO == correo || correo === ""))) {

                eventBitacora(new Date, quienModifico, idPantalla, 'ACTUALIZACION', `DATOS ACTUALIZADOS AL USUARIO ${usuarioModelo.USUARIO}: ${nombre_usuario !== "" ? '`NOMBRE`' : ""}
                 ${estado !== "" ? '`ESTADO`' : ""} ${correo !== "" ? '`CORREO`' : ""} ${id_rol !== "" ? '`ROL`' : ""} ${fechaVencimiento !== "" ? '`VENCIMIENTO`' : ""}`);

        }

        // Actualizar db Usuario
        await usuarioModelo.update({
            NOMBRE_USUARIO: nombre_usuario !== "" ? nombre_usuario : Usuario.NOMBRE_USUARIO,
            ESTADO_USUARIO: estado !== "" ? estado : Usuario.ESTADO_USUARIO,
            CORREO_ELECTRONICO: correo !== "" ? correo : Usuario.CORREO_ELECTRONICO,
            ID_ROL: id_rol !== "" ? id_rol : Usuario.ID_ROL,
            FECHA_VENCIMIENTO: fechaVencimiento !== "" ? fechaVencimiento : Usuario.FECHA_VENCIMIENTO,
            MODIFICADO_POR: quienModifico
        }, {
            where: {
                ID_USUARIO: id_usuario
            }
        })

        if( correo !== "" && (nombre_usuario === "" && estado === "" && id_rol === "")) {
            
            return res.json({
                ok: true,
                msg: 'El correo ha sido actualizado'
            });

        }

        if( nombre_usuario !== "" && (correo === "" && estado === "" && id_rol === "")) {
            return res.json({
                ok: true,
                msg: 'El nombre del usuario ha sido actualizado'
            });
        }

        return res.json({
            ok: true,
            msg: 'Los datos del usuario '+ usuarioModelo.USUARIO.toLowerCase() +' han sido actualizados'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const putContrasena = async (req = request, res = response) => {
    const { id_usuario } = req.params;
    let { contrasena, confirmContrasena, quienModifico } = req.body;

    try {

        // Validar que hagan match la confirmación de contraseña
        if( contrasena !== confirmContrasena ) {
            return res.status(401).json({
                ok: false,
                msg: `Contraseña no coincide`
            })
        }

        // Validar usuario inactivo
        const estadoUsuario = await Usuario.findOne({where: {ID_USUARIO: id_usuario}})
        if(estadoUsuario.ESTADO_USUARIO === 'INACTIVO'){
            eventBitacora(new Date, quienModifico, 12, 'ACTUALIZACION', 'ACTUALIZACION DE CONTRASEÑA NO PERMITIDA');
            return res.status(401).json({
                ok: false,
                msg: `El usuario ${estadoUsuario.USUARIO}, no tiene permisos de cambiar la contraseña`
            })
        }

        // Validar si existe la misma contraseña en el historial de contraseñas
        const buscarContrasena = await HistorialContrasena.findAll({where: {ID_USUARIO: id_usuario}});
        for await (const contra of buscarContrasena){

            if (await bcrypt.compareSync( contrasena, contra.CONTRASENA )) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La contraseña ya existe en el historial'
                })
            }
        }

        // Hashear contraseña
        const salt = bcrypt.genSaltSync();
        contrasena = bcrypt.hashSync(contrasena, salt);

        // Validar existencia
        if( !estadoUsuario ){
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        // Validar numero del historial
        const countContrasenas = await HistorialContrasena.count({where:{ID_USUARIO: id_usuario}});
        if (countContrasenas >= 10) {
            const primeraContrasena = await HistorialContrasena.findOne({order:["ID_HIST"], limit: 1})
            await primeraContrasena.destroy();
        }

        const historialContrasena = await HistorialContrasena.build({
            ID_USUARIO: id_usuario,
            CONTRASENA: contrasena
        })
        
        await historialContrasena.save();

        // ----------------- DEFINIR ESTADO --------------------

        // Traer el número de preguntas configuradas del usuario
        const countPreguntasUser = await PreguntaUsuario.count({where: {
            ID_USUARIO: id_usuario
        }})
        
        // Traer los parametros de número de preguntas
        const parametroNumPreguntas = await Parametro.findOne({
            where: {
                PARAMETRO: 'ADMIN_PREGUNTAS'
            }
        })
        
        
        // Si el usuario esta bloqueado, se activara, si tiene otro estado, se mantiene su estado
        if(estadoUsuario.ESTADO_USUARIO === 'BLOQUEADO' || estadoUsuario.ESTADO_USUARIO === 'NUEVO') {
            if(countPreguntasUser >= parametroNumPreguntas.VALOR) {
                estadoUsuario.ESTADO_USUARIO = 'ACTIVO'
            } else {
                estadoUsuario.ESTADO_USUARIO = 'NUEVO'
            }
        }

        // Asignar contraseña encryptada y reiniciar intentos
        estadoUsuario.CONTRASENA = contrasena;
        estadoUsuario.INTENTOS = 0;

        // Traer días de vigencia de parametros
        const diasVigencias = await Parametro.findOne({
            where:{
                PARAMETRO: 'ADMIN_DIAS_VIGENCIA'
            }
        });

        // ------------------- Actualizar fecha de vencimiento ------------------
        // Calcular fecha de vencimiento
        const fechaActual = new Date();
        const fechaVencimiento = (modificarDias(fechaActual, parseInt(diasVigencias.VALOR,10)));

        // Actualizar modificado por:
        estadoUsuario.MODIFICADO_POR = quienModifico;

        estadoUsuario.FECHA_VENCIMIENTO = fechaVencimiento;
        await estadoUsuario.save();

        const usuario = estadoUsuario;
        
        eventBitacora(new Date, quienModifico, 12
            , 'ACTUALIZACION', 'ACTUALIZACION DE CONTRASEÑA EXITOSA');

        res.json({
            ok: true,
            msg: 'La contraseña ha sido actualizada con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const cambioContrasenaPerfil = async (req = request, res = response) => {
    const { id_usuario } = req.params;
    let { contrasena, confirmContrasena, confirmContrasenaActual } = req.body;

    try {

        // Validar usuario
        const Usuario = await Usuarios.findOne({where: {ID_USUARIO: id_usuario}})
        
        // Validar existencia
        if( !Usuario ){
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        // Validar que hagan match la confirmación de contraseña
        if( contrasena !== confirmContrasena ) {
            return res.status(401).json({
                ok: false,
                msg: `Contraseña no coincide`
            })
        }

        // Validar si existe la misma contraseña en el historial de contraseñas
        const buscarContrasena = await HistorialContrasena.findAll({where: {ID_USUARIO: id_usuario}});
        for await (const contra of buscarContrasena){

            if (await bcrypt.compareSync( contrasena, contra.CONTRASENA )) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La contraseña ya existe en el historial'
                })
            }
        }

        // Hashear contraseña
        const salt = bcrypt.genSaltSync();
        contrasena = bcrypt.hashSync(contrasena, salt);

        // Validar numero del historial
        const countContrasenas = await HistorialContrasena.count({where:{ID_USUARIO: id_usuario}});
        if (countContrasenas >= 10) {
            const primeraContrasena = await HistorialContrasena.findOne({order:["ID_HIST"], limit: 1})
            await primeraContrasena.destroy();
        }

        const historialContrasena = await HistorialContrasena.build({
            ID_USUARIO: id_usuario,
            CONTRASENA: contrasena
        })
        
        await historialContrasena.save();    

        // Asignar contraseña encryptada y reiniciar intentos
        Usuario.CONTRASENA = contrasena;
        Usuario.INTENTOS = 0;

        // Traer días de vigencia de parametros
        const diasVigencias = await Parametro.findOne({
            where:{
                PARAMETRO: 'ADMIN_DIAS_VIGENCIA'
            }
        });

        // ------------------- Actualizar fecha de vencimiento ------------------
        // Calcular fecha de vencimiento
        const fechaActual = new Date();
        const fechaVencimiento = (modificarDias(fechaActual, parseInt(diasVigencias.VALOR,10)));

        // Actualizar modificado por:
        Usuario.MODIFICADO_POR = id_usuario;

        Usuario.FECHA_VENCIMIENTO = fechaVencimiento;
        await Usuario.save();
        
        eventBitacora(new Date, id_usuario, 13, 'ACTUALIZACION', Usuario.USUARIO+' ACTUALIZO SU CONTRASEÑA CON ÉXITO');

        res.json({
            ok: true,
            msg: 'La contraseña ha sido actualizada con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const contrasenaGenerador = async (req = request, res = response) => { 

    try {
        
        const maxContra = await Parametro.findOne({where: {
            PARAMETRO: 'MAX_CONTRASENA'
        }})
    
        const password = generator.generate({
            length: maxContra.VALOR,
            numbers: true,
            uppercase: true,
            symbols: true,
            exclude: '|[]*\\`&°~^><}{',
            strict: true,
        })
    
        res.json(password)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }

}

const cambioContrasenaMantenimiento = async (req = request, res = response) => { 
    const { id_usuario } = req.params;
    let { contrasena, quienModifico } = req.body;

    try {

        // Validar usuario inactivo
        const estadoUsuario = await Usuario.findOne({where: {ID_USUARIO: id_usuario}})

        // Validar si existe la misma contraseña en el historial de contraseñas
        const buscarContrasena = await HistorialContrasena.findAll({where: {ID_USUARIO: id_usuario}});
        for await (const contra of buscarContrasena){

            if (await bcrypt.compareSync( contrasena, contra.CONTRASENA )) {
                return res.status(400).json({
                    ok: false,
                    msg: 'La contraseña ya existe en el historial'
                })
            }
        }

        // Hashear contraseña
        const salt = bcrypt.genSaltSync();
        contrasena = bcrypt.hashSync(contrasena, salt);

        // Validar existencia
        if( !estadoUsuario ){
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con el id ' + id_usuario
            })
        }

        // Validar numero del historial
        const countContrasenas = await HistorialContrasena.count({where:{ID_USUARIO: id_usuario}});
        if (countContrasenas >= 10) {
            const primeraContrasena = await HistorialContrasena.findOne({order:["ID_HIST"], limit: 1})
            await primeraContrasena.destroy();
        }

        const historialContrasena = HistorialContrasena.build({
            ID_USUARIO: id_usuario,
            CONTRASENA: contrasena
        })
        
        await historialContrasena.save();

        // ----------------- DEFINIR ESTADO --------------------

        // Traer el número de preguntas configuradas del usuario
        const countPreguntasUser = await PreguntaUsuario.count({where: {
            ID_USUARIO: id_usuario
        }})
        
        // Traer los parametros de número de preguntas
        const parametroNumPreguntas = await Parametro.findOne({
            where: {
                PARAMETRO: 'ADMIN_PREGUNTAS'
            }
        })
        
        // Si el usuario esta bloqueado, se activara, si tiene otro estado, se mantiene su estado
        if(estadoUsuario.ESTADO_USUARIO === 'BLOQUEADO' || estadoUsuario.ESTADO_USUARIO === 'NUEVO') {
            if(countPreguntasUser >= parametroNumPreguntas.VALOR) {
                estadoUsuario.ESTADO_USUARIO = 'ACTIVO'
            } else {
                estadoUsuario.ESTADO_USUARIO = 'NUEVO'
            }
        }

        // Asignar contraseña encryptada y reiniciar intentos
        estadoUsuario.CONTRASENA = contrasena;
        estadoUsuario.INTENTOS = 0;

        // Traer días de vigencia de parametros
        const diasVigencias = await Parametro.findOne({
            where:{
                PARAMETRO: 'ADMIN_DIAS_VIGENCIA'
            }
        });

        // ------------------- Actualizar fecha de vencimiento ------------------
        // Calcular fecha de vencimiento
        const fechaActual = new Date();
        const fechaVencimiento = (modificarDias(fechaActual, parseInt(diasVigencias.VALOR,10)));

        // Actualizar modificado por:
        estadoUsuario.MODIFICADO_POR = quienModifico;
        estadoUsuario.FECHA_VENCIMIENTO = fechaVencimiento;

        if(estadoUsuario.USUARIO !== 'ROOT') {

            estadoUsuario.PASS_RESETEADO = true;
            
        }

        await estadoUsuario.save();
        
        eventBitacora(new Date, quienModifico, 2
            , 'ACTUALIZACION', 'ACTUALIZACION DE CONTRASEÑA EXITOSA DEL USUARIO '+estadoUsuario.USUARIO);

        res.json({
            ok: true,
            msg: 'La contraseña ha sido actualizada con éxito'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
    }
}

const crearUsuarioMantenimiento = async (req = request, res = response) => { 
    const { usuario = "", nombre_usuario = "", contrasena = "", id_rol = "", correo = "", quienCreo = "" } = req.body;

    try {

        // Traer días de vigencia de parametros
        const diasVigencias = await Parametro.findOne({
            where:{
                PARAMETRO: 'ADMIN_DIAS_VIGENCIA'
            }
        });

        // Calcular fecha de vencimiento
        const fechaActual = new Date();
        const fechaVencimiento = (modificarDias(fechaActual, parseInt(diasVigencias.VALOR,10)));  

        // Crear usuario con el modelo
        DBusuario = Usuario.build({
            USUARIO: usuario,
            NOMBRE_USUARIO: nombre_usuario,
            CONTRASENA :contrasena,
            CORREO_ELECTRONICO: correo,
            FECHA_VENCIMIENTO: fechaVencimiento,
            ID_ROL: id_rol
        })

        // Hashear contraseña
        const salt = bcrypt.genSaltSync();
        DBusuario.CONTRASENA = bcrypt.hashSync(contrasena, salt);

        // Crear usuario de DB
        await DBusuario.save()

        //''''''''''''''''''''''' Guardar contraseña en historial ''''''''''''''''''''''''''

        // Llamar al usuario recien creado
        const usuarioCreado = await Usuario.findOne({where:{USUARIO: usuario}});

        historialContrasena = HistorialContrasena.build({
            ID_USUARIO: usuarioCreado.ID_USUARIO,
            CONTRASENA: DBusuario.CONTRASENA
        })

        historialContrasena.save();

        // Traer ID del usuario creado
        const user = await Usuario.findByPk(quienCreo);
        //Actualizar quién lo modifico y creo
        await Usuario.update({
            CREADO_POR: user.ID_USUARIO,
            MODIFICADO_POR: user.ID_USUARIO
        },{
            where:{
                USUARIO: usuario 
            }
        })

        // ------------------ Mandar Correos ----------------------

        // Para enviar correos
        const transporte = await crearTransporteSMTP();

        // Parametros del mailer
        const correoSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_CORREO' }});
        const nombreEmpresaSMTP = await Parametro.findOne({where: { PARAMETRO: 'SMTP_NOMBRE_EMPRESA' }});

        // Al usuario
        transporte.sendMail({
            from: `"${nombreEmpresaSMTP.VALOR} 🍔" <${correoSMTP.VALOR}>`, // Datos de emisor
	    	to: correo, // Receptor
	    	subject: "¡Cuenta creada! 🍔👌", // Asunto
	    	html: `<b>Bienvenido a Dr. Buger, su cuenta ha sido creada
            <hr>Usuario: ${usuario} 
            <br>Contraseña: ${contrasena} 
            <br>Para ingresar entre en el siguiente enlace:</b>
            <a href=http://localhost:4200/auth/login/>Iniciar Sesión</a><br>`
	    }, (err) => {
            if(err) { console.log( err ) };
        });

        // Guardar evento
        eventBitacora(new Date, user.ID_USUARIO, 2, 'NUEVO', 'SE CREÓ EL USUARIO '+usuario);

        // Generar respuesta exitosa
        return res.status(201).json({
            ok: true,
            msg: 'Usuario creado con éxito'
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Por favor hable con el administrador'
        });
    }
}

module.exports = {
    registrar,
    crearUsuarioMantenimiento,
    getUsuarios,
    getUsuario,
    bloquearUsuario,
    putContrasena,
    putUsuario,
    cambioContrasenaPerfil,
    contrasenaGenerador,
    cambioContrasenaMantenimiento
}
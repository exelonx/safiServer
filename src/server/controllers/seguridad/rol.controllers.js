const { request, response } = require("express");
const { Op, ForeignKeyConstraintError } = require("sequelize");

const Rol = require("../../models/seguridad/rol");
const ViewRol = require("../../models/seguridad/sql-vistas/view_rol");
const Parametro = require("../../models/seguridad/parametro");
const { eventBitacora } = require("../../helpers/event-bitacora");
const Objeto = require("../../models/seguridad/objeto");
const Permiso = require("../../models/seguridad/permiso");
const TipoNotificacion = require("../../models/notificacion/tipo_notificacion");
const PermisoNotificacion = require("../../models/notificacion/permiso_notificacion");
const Usuarios = require("../../models/seguridad/usuario");

// Llamar todos los roles paginados
const getRoles = async (req = request, res = response) => {
  let { limite, desde = 0, buscar = "", id_usuario } = req.query;

  try {
    // Definir el número de objetos a mostrar
    if (!limite || limite === "") {
      const { VALOR } = await Parametro.findOne({
        where: { PARAMETRO: "ADMIN_NUM_REGISTROS" },
      });
      limite = VALOR;
    }

    if (desde === "") {
      desde = 0;
    }

    // Paginación
    const roles = await ViewRol.findAll({
      limit: parseInt(limite, 10),
      offset: parseInt(desde, 10),
      where: {
        [Op.or]: [
          {
            ROL: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            DESCRIPCION: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
        ],
      },
    });

    // Contar resultados total
    const countRoles = await ViewRol.count({
      where: {
        [Op.or]: [
          {
            ROL: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            DESCRIPCION: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
        ],
      },
    });

    // Guardar evento
    if (buscar !== "" && desde == 0) {
      eventBitacora(
        new Date(),
        id_usuario,
        8,
        "CONSULTA",
        `SE BUSCO LOS ROL CON EL TERMINO ${buscar}`
      );
    }

    // Respuesta
    res.json({ limite, countRoles, roles });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error.message,
    });
  }
};

// Para llamar 1 solo Rol
const getRol = async (req = request, res = response) => {
  const { id_rol } = req.params;

  try {
    const rol = await ViewRol.findByPk(id_rol);

    // Validar Existencia
    if (!rol) {
      return res.status(404).json({
        msg: "No existe un rol con el id " + id_rol,
      });
    }

    res.json({ rol });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error.message,
    });
  }
};

const postRol = async (req = request, res = response) => {
  //body
  const { rol, descripcion, id_usuario } = req.body;

  try {

    // Crear en DB
    const nuevoRol = await Rol.create({
      ROL: rol,
      DESCRIPCION: descripcion,
      CREADO_POR: id_usuario,
      MODIFICADO_POR: id_usuario,
    });

    const instanciaRol = await Rol.findOne({where: {ROL: rol}})

    // Responder
    res.json({
        ok: true,
        msg: "Rol: " + rol + " ha sido creado con éxito",
    });

    //------------------ CREAR PERMISOS DE SISTEMA -----------------------
    // Traer todas las pantallas para crear el permiso del rol
    const pantallas = await Objeto.findAll({
      where: {
        [Op.and]: [
          {
            TIPO_OBJETO: {
              [Op.not]: "AUTH",
            },
          },
          {
            TIPO_OBJETO: {
              [Op.not]: "LOGOUT",
            },
          },
        ],
      },
    });

    // Por cada pantalla, crear un permiso
    for await (let pantalla of pantallas) {
      await Permiso.create({
        ID_ROL: instanciaRol.ID_ROL,
        ID_OBJETO: pantalla.ID_OBJETO,
        PERMISO_INSERCION: false,
        PERMISO_ELIMINACION: false,
        PERMISO_ACTUALIZACION: false,
        PERMISO_CONSULTAR: false,
        CREADO_POR: id_usuario,
        MODIFICADO_POR: id_usuario,
      });
    }

    //------------------ CREAR PERMISOS DE NOTIFICACIONES -----------------------
    const tipoNotificacion = await TipoNotificacion.findAll();

    // Por cada tipo de notificación, crear un permiso
    for await (let tipo of tipoNotificacion) {
      await PermisoNotificacion.create({
        ID_ROL: instanciaRol.ID_ROL,
        ID_TIPO_NOTIFICACION: tipo.id,
        RECIBIR_NOTIFICACION: false,
        CREADO_POR: id_usuario,
        MODIFICADO_POR: id_usuario,
      });
    }

    // Guardar evento
    eventBitacora(
      new Date(),
      id_usuario,
      8,
      "NUEVO",
      `SE CREO EL ROL ${nuevoRol.ROL}`
    );

  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

const putRol = async (req = request, res = response) => {
  const { id_rol } = req.params;
  const { rol = "", descripcion = "", id_usuario = "" } = req.body;

  try {
    const rolAnterior = await Rol.findByPk(id_rol);

    if (rolAnterior.ROL === "DEFAULT") {
      return res.status(401).json({
        ok: false,
        msg: "No se puede modificar el rol DEFAULT",
      });
    }

    if (rolAnterior.ROL === "ADMINISTRADOR") {
      return res.status(401).json({
        ok: false,
        msg: "No se puede modificar el rol ADMINISTRADOR",
      });
    }

    // Si llega sin cambios
    if (
      !(
        (rolAnterior.ROL == rol || rol === "") &&
        (rolAnterior.DESCRIPCION == descripcion || descripcion === "")
      )
    ) {
      eventBitacora(
        new Date(),
        id_usuario,
        8,
        "ACTUALIZACION",
        `DATOS ACTUALIZADOS: ${rol !== "" ? "ROL" : ""}
                 ${descripcion !== "" ? "DESCRIPCIÓN" : ""}`
      );
    }

    // Actualizar db Rol
    await Rol.update(
      {
        ROL: rol !== "" ? rol : Rol.ROL,
        DESCRIPCION: descripcion !== "" ? descripcion : Rol.DESCRIPCION,
        MODIFICADO_POR: id_usuario,
      },
      {
        where: {
          ID_ROL: id_rol,
        },
      }
    );

    return res.json({
      ok: true,
      msg: "Rol: " + rolAnterior.ROL + " ha sido actualizado con éxito",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

const DeleteRol = async (req = request, res = response) => {
  const { id_rol } = req.params;
  const { quienElimina } = req.query;

  try {
    // Llamar el Rol a borrar
    const rol = await Rol.findByPk(id_rol);

    // Extraer el nombre del Rol
    const { ROL, ID_ROL } = rol;

    const usuarios = await Usuarios.count({ where: {ID_ROL: id_rol} });

    // Validar que el rol no esta siendo usado
    if(usuarios == 0) {

      // Eliminar permisos configurados
      await Permiso.destroy({ where: {ID_ROL: id_rol} });
      await PermisoNotificacion.destroy({ where: {ID_ROL: id_rol} });
      
    }

    // Borrar Rol
    await rol.destroy();
    


    // Guardar evento
    eventBitacora(
      new Date(),
      quienElimina,
      8,
      "BORRADO",
      `SE ELIMINO EL ROL ${ROL}`
    );

    res.json({
      ok: true,
      msg: `El rol: ${ROL} ha sido eliminado`,
    });
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      res.status(403).json({
        ok: false,
        msg: `El rol no puede ser eliminado`,
      });
    } else {
      console.log(error);
      res.status(500).json({
        msg: error.message,
      });
    }
  }
};

module.exports = {
  getRoles,
  getRol,
  postRol,
  putRol,
  DeleteRol,
};

const { request, response } = require("express");
const { Op } = require("sequelize");
const jwt = require('jsonwebtoken')

const Permisos = require("../../models/seguridad/permiso");
const ViewPermisos = require("../..//models/seguridad/sql-vistas/view-permiso");
const Objeto = require("../../models/seguridad/objeto");
const Roles = require("../../models/seguridad/rol");
const Permiso = require("../../models/seguridad/permiso");
const Parametro = require("../../models/seguridad/parametro");
const { eventBitacora } = require("../../helpers/event-bitacora");
const Usuarios = require("../../models/seguridad/Usuario");

const validarPermiso = async (req = request, res = response) => {
  let { pantalla } = req.params
  const token = req.header('x-token')

  try {

    // Extraer id del usuario del token
    const { uid } = jwt.verify( token, process.env.SEMILLA_SECRETA_JWT_LOGIN );

    // Instanciar usuario
    const usuario = await Usuarios.findByPk(uid);

    // Validar si es el usuario ROOT
    if( usuario.USUARIO === 'ROOT' ) {
      return res.json({
        PERMISO_INSERCION: true,
        PERMISO_ELIMINACION: true,
        PERMISO_ACTUALIZACION: true,
        PERMISO_CONSULTAR: true,
      })
    }

    // Extraer el rol del usuario
    const rol = usuario.ID_ROL;

    // Verificar si tiene permiso de consulta
    const permiso = await Permiso.findOne({where: {
      ID_ROL: rol,
      ID_OBJETO: pantalla
    }})

    if(!permiso) {
      return res.status(404).json({
        ok: false,
        msg: 'No existe un permiso asignado al rol'
      })
    }

    return res.json(permiso)

  } catch (error) {
    console.log(error);
        res.status(500).json({
            ok: false,
            msg: error.message
        })
  }
}

const getPermisos = async (req = request, res = response) => {
  let {
    limite,
    desde = 0,
    buscar = "",
    id_usuario,
    id_rol = "",
    id_pantalla = "",
  } = req.query;
  let filtrarPorRol = {};
  let filtrarPorPantalla = {};
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

    if (id_rol !== "") {
      filtrarPorRol = {
        ID_ROL: id_rol,
      };
    }

    if (id_pantalla !== "") {
      filtrarPorPantalla = {
        ID_OBJETO: id_pantalla,
      };
    }

    //Paginacion
    const permisos = await ViewPermisos.findAll({
      limit: parseInt(limite, 10),
      offset: parseInt(desde, 10),
      where: {
        [Op.or]: [
          {
            ROL: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            OBJETO: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
        ],
        [Op.and]: [filtrarPorRol, filtrarPorPantalla],
      },
    });

    const countPermisos = await ViewPermisos.count({
      where: {
        [Op.or]: [
          {
            ROL: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            OBJETO: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            CREADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
          {
            MODIFICADO_POR: { [Op.like]: `%${buscar.toUpperCase()}%` },
          },
        ],
        [Op.and]: [filtrarPorRol, filtrarPorPantalla],
      },
    });

    //Respuesta
    res.json({ limite, countPermisos, permisos });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error.message,
    });
  }
};

const getPermiso = async (req = request, res = response) => {
  const { id_permiso } = req.params;

  try {
    const permiso = await ViewPermisos.findByPk(id_permiso);

    // Validar Existencia
    if (!permiso) {
      return res.status(404).json({
        msg: `No existe el permiso con el id` + id_permiso,
      });
    }

    res.json(permiso);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error.message,
    });
  }
};

const putPermisos = async (req = request, res = response) => {
  const { id_permiso } = req.params;
  const {
    permiso_insercion = "",
    permiso_eliminacion = "",
    permiso_actualizacion = "",
    permiso_consultar = "",
    id_usuario = "",
  } = req.body;

  try {
    // const usuario = await Usuarios.findByPk(id_usuario);

    // if(usuario.ID_ROL) {}

    const permisoSistema = await ViewPermisos.findByPk(id_permiso);

    await Permisos.update(
      {
        PERMISO_INSERCION:
          permiso_insercion !== ""
            ? permiso_insercion
            : Permisos.PERMISO_INSERCION,
        PERMISO_ELIMINACION:
          permiso_eliminacion !== ""
            ? permiso_eliminacion
            : Permisos.PERMISO_ELIMINACION,
        PERMISO_ACTUALIZACION:
          permiso_actualizacion !== ""
            ? permiso_actualizacion
            : Permisos.PERMISO_ACTUALIZACION,
        PERMISO_CONSULTAR:
          permiso_consultar !== ""
            ? permiso_consultar
            : Permisos.PERMISO_CONSULTAR,
        MODIFICADO_POR: id_usuario,
      },
      {
        where: {
          ID_PERMISO: id_permiso,
        },
      }
    );

    // Si llega con cambios se registran cambios y manda correo
    if (
      !(
        (permisoSistema.PERMISO_INSERCION == permiso_insercion ||
          permiso_insercion === "") &&
        (permisoSistema.PERMISO_ELIMINACION == permiso_eliminacion ||
          permiso_eliminacion === "") &&
        (permisoSistema.PERMISO_ACTUALIZACION == permiso_actualizacion ||
          permiso_actualizacion === "") &&
        (permisoSistema.PERMISO_CONSULTAR == permiso_consultar ||
          permiso_consultar === "")
      )
    ) {
      eventBitacora(
        new Date(),
        id_usuario,
        9,
        "ACTUALIZACION",
        `PERMISOS DE SISTEMA DEL ROL ${permisoSistema.ROL} ACTUALIZADOS: ${
          permiso_insercion !== "" &&
          permisoSistema.PERMISO_INSERCION != permiso_insercion
            ? "`GUARDAR`"
            : ""
        }${
          permiso_eliminacion !== "" &&
          permisoSistema.PERMISO_ELIMINACION != permiso_eliminacion
            ? "`ELIMINACIÓN`"
            : ""
        } ${
          permiso_actualizacion !== "" &&
          permisoSistema.PERMISO_ACTUALIZACION != permiso_actualizacion
            ? "`ACTUALIZAR`"
            : ""
        } ${
          permiso_consultar !== "" &&
          permisoSistema.PERMISO_CONSULTAR != permiso_consultar
            ? "`CONSULTAR`"
            : ""
        }`
      );
    }

    res.json({ ok: true, msg: "Permiso actualizado con éxito" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: error.message,
    });
  }
};

const configPermisosIniciales = async (req = request, res = response) => {
  // Traer todos los roles
  const roles = await Roles.findAll();

  // Traer todos las pantallas
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

  // Recorrer todos los roles
  for await (let rol of roles) {
    // Buscar que roles no tienen permisos de pantallas
    if (!(await Permiso.findOne({ where: { ID_ROL: rol.ID_ROL } }))) {
      // Si el rol es el de administrador darle privilegios máximos
      if (rol.ID_ROL === 1) {
        // Configurar todos los permisos por cada tipo de notificacion
        for await (let pantalla of pantallas) {
          await Permiso.create({
            ID_ROL: rol.ID_ROL,
            ID_OBJETO: pantalla.ID_OBJETO,
            PERMISO_INSERCION: true,
            PERMISO_ELIMINACION: true,
            PERMISO_ACTUALIZACION: true,
            PERMISO_CONSULTAR: true,
            CREADO_POR: 1,
            MODIFICADO_POR: 1,
          });
        }
      } else {
        // Configurar todos los permisos por cada tipo de notificacion
        // PERO SIN PRIVILEGIOS
        for await (let pantalla of pantallas) {
          await Permiso.create({
            ID_ROL: rol.ID_ROL,
            ID_OBJETO: pantalla.ID_OBJETO,
            PERMISO_INSERCION: false,
            PERMISO_ELIMINACION: false,
            PERMISO_ACTUALIZACION: false,
            PERMISO_CONSULTAR: false,
            CREADO_POR: 1,
            MODIFICADO_POR: 1,
          });
        }
      }
    }
  }

  // Buscar que roles tienen permisos de ver

  res.json({
    ok: true,
  });
};

module.exports = {
  getPermisos,
  getPermiso,
  putPermisos,
  configPermisosIniciales,
  validarPermiso
};

const Usuarios = require("../models/usuariosModelo");
const MediosPago = require("../models/mediosPagoModelo");
const Plataformas = require("../models/plataformasModelo");
const Asignaciones = require("../models/asignacionesModelo");
const Cargas = require("../models/cargasModelo");
const { Op } = require("sequelize");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const shortid = require("shortid");
const { v4: uuid_v4 } = require("uuid");
const Suscripciones = require("../models/suscripcionesModelo");

// Comercios
exports.comercios = async (req, res) => {

  const usuarios = await Usuarios.findAll({
    where: { perfil: "comercio" },
  });

  res.render("dashboard/comercios", {
    nombrePagina: "Administrador Comercios",
    titulo: "Administrador Comercios",
    breadcrumb: "Administrador Comercios",
    classActive: req.path.split("/")[2],
    usuarios,
  });
};

exports.cambioPerfil = async (req, res) => {
  const id_usuario = req.body.id.trim();
  const perfil_usuario = req.body.perfil.trim();

  const usuario = await Usuarios.findOne({ where: { id_usuario: id_usuario } });

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "No es posible actualizar el perfil del usuario.",
    });
    return;
  }

  // si existe confirmar cuenta y redireccionar
  usuario.perfil = perfil_usuario;
  await usuario.save();

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "Perfil actualizado con éxito.",
  });
  return;
};

exports.bloqueoUsuario = async (req, res) => {
  const id_usuario = req.body.id.trim();

  const usuario = await Usuarios.findOne({ where: { id_usuario: id_usuario } });

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "No es posible bloquear el usuario.",
    });
    return;
  }

  if (usuario.bloqueo === 1) {
    var bloqueo = 0;
    var descripcion = "Usuario desbloqueado con éxito.";
  } else {
    var bloqueo = 1;
    var descripcion = "Usuario bloqueado con éxito.";
  }

  // si existe confirmar cuenta y redireccionar
  usuario.bloqueo = bloqueo;
  await usuario.save();

  res.json({ titulo: "¡Que bien!", resp: "success", descripcion: descripcion });
  return;
};

exports.editarUsuario = async (req, res) => {
  const id_usuario = req.body.id.trim();
  const nombre = req.body.nombre.trim();
  const email = req.body.email.trim();
  const direccion = req.body.direccion.trim();
  const telefono = req.body.telefono.trim();
  const pais = req.body.pais.trim();

  const usuario = await Usuarios.findOne({ where: { id_usuario: id_usuario } });

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "No es posible editar el usuario.",
    });
    return;
  }

  usuario.email = email;
  usuario.nombre = nombre;
  usuario.direccion = direccion;
  usuario.telefono_movil = telefono;
  usuario.pais = pais;

  await usuario.save();

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "Usuario editado con éxito.",
  });
  return;
};

exports.eliminarUsuario = async (req, res) => {
  const id_usuario = req.body.id.trim();

  const usuario = await Usuarios.findOne({ where: { id_usuario: id_usuario } });

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "No es posible eliminar el usuario.",
    });
    return;
  }

  await Usuarios.destroy({ where: { id_usuario: id_usuario } });

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "Usuario eliminado con éxito.",
  });
  return;
};

exports.asignarPlataformaSuperdistribuidor = async (req, res) => {
  const id_usuario = req.body.id.trim();
  const objetoAsignaciones = req.body.asignaciones;
  console.log(objetoAsignaciones);

  if (objetoAsignaciones === "" || objetoAsignaciones.length < 1) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion:
        "No es posible asignar las plataformas, debe ingresar algún valor en las casillas.",
    });
    return;
  }

  // datos del usuario a asignar
  const usuario = await Usuarios.findOne({
    where: {
      [Op.and]: [{ id_usuario: id_usuario }, { bloqueo: 0 }],
    },
    attributes: ["patrocinador", "super_patrocinador"],
  });

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion:
        "No es posible asignar las plataformas a este usuario ya que se encuentra bloqueado o no existe en la plataforma",
    });
    return;
  }

  const enlace_distribuidor = usuario.patrocinador;
  const enlace_superdistribuidor = usuario.super_patrocinador;

  // id distribuidor
  const distribuidor = await Usuarios.findOne({
    where: { enlace_afiliado: enlace_distribuidor },
    attributes: ["id_usuario"],
  });
  const idDistribuidor = distribuidor.id_usuario;

  // id superdistribuidor
  const superdistribuidor = await Usuarios.findOne({
    where: { enlace_afiliado: enlace_superdistribuidor },
    attributes: ["id_usuario"],
  });
  const idSuperdistribuidor = superdistribuidor.id_usuario;

  // recorrer array con asignaciones
  for (var i = 0; i < objetoAsignaciones.length; i++) {
    const idPlataforma = objetoAsignaciones[i][0].id;
    console.log("id plataforma:" + idPlataforma);
    console.log("id usuario:" + id_usuario);

    const valorPlataforma = objetoAsignaciones[i][0].valor;
    const valorPlataforma2 = objetoAsignaciones[i][0].valor;

    const asignacionDistribuidor = await Asignaciones.findOne({
      where: {
        [Op.and]: [
          { usuarioIdUsuario: req.user.id_usuario },
          { plataformaIdPlataforma: idPlataforma },
        ],
      },
      attributes: ["valor"],
    });

    let menorValor;
    let resellerDiference;

    const minimusPriceFromDistribuidores = await Asignaciones.findOne({
      where: {
        [Op.and]: [
          { id_distribuidor: id_usuario },
          { plataformaIdPlataforma: idPlataforma },
        ],
      },
      order: [["valor", "ASC"]],
    });

    if (minimusPriceFromDistribuidores) {
      menorValor = minimusPriceFromDistribuidores.valor;
      resellerDiference = false;
    } else {
      menorValor = 100000000000;
      resellerDiference = true;
    }

    if (objetoAsignaciones[i][0].id === "") {
      res.json({
        titulo: "¡Lo Sentimos!",
        resp: "error",
        descripcion: "No has hecho cambios en las plataformas",
      });

      return;
    }

    if (Number(asignacionDistribuidor.valor) > Number(valorPlataforma)) {
      res.json({
        titulo: "¡Lo Sentimos!",
        resp: "error",
        descripcion:
          "No es posible asignar el valor a ${} ya es que menor o igual a su valor asignado.",
      });

      return;
    }

    if (valorPlataforma !== "") {
      const asignacion = await Asignaciones.findOne({
        where: {
          [Op.and]: [
            { usuarioIdUsuario: id_usuario },
            { plataformaIdPlataforma: idPlataforma },
          ],
        },
      });

      const plataforma = await Plataformas.findOne({
        where: {
          id_plataforma: idPlataforma,
        },
        attributes: ["plataforma"],
      });

      const nombrePlataforma = plataforma.plataforma;
      const diferencial = Number(valorPlataforma) - Number(asignacion.valor);

      console.log("Menor valor");
      console.log(menorValor);

      console.log("Diferencial");
      console.log(diferencial);

      console.log("valor plataforma");
      console.log(valorPlataforma);

      if (Number(diferencial) > 1000 && !resellerDiference) {
        res.json({
          titulo: "¡Lo Sentimos!",
          resp: "error",
          descripcion: `No es posible aumentar el valor a la plataforma ${nombrePlataforma} debido a que excede el valor permitido de aumento.`,
        });

        return;
      }

      if (Number(valorPlataforma2) > Number(menorValor)) {
        res.json({
          titulo: "¡Lo Sentimos!",
          resp: "error",
          descripcion: `No es posible aumentar el valor a la plataforma ${nombrePlataforma} debido a que excede el valor permitido de aumento.`,
        });

        return;
      }

      if (asignacion !== null) {
        asignacion.valor = valorPlataforma;
        await asignacion.save();
      } else {
        await Asignaciones.create({
          id_asignacion: uuid_v4(),
          valor: valorPlataforma,
          id_distribuidor: idDistribuidor,
          id_superdistribuidor: idSuperdistribuidor,
          usuarioIdUsuario: id_usuario,
          plataformaIdPlataforma: idPlataforma,
        });
      }
    }
  }

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "Las plataformas se asignaron con éxito al usuario.",
  });
  return;
};

exports.tablaAsignarPlataformas = async (req, res) => {
  const id_usuario = req.body.id.trim();

  const asignaciones = await Asignaciones.findAll({
    where: {
      [Op.and]: [{ usuarioIdUsuario: id_usuario }],
    },
  });

  res.json(asignaciones);
  return;
};

// ============================================================================
//                      Superdistribuidores controller
// ============================================================================

// Admin Usuarios
exports.adminUsuariosSuperdistribuidor = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: { id_usuario: req.user.id_usuario },
  });
  const usuarios = await Usuarios.findAll({
    where: {
      [Op.and]: [
        { super_patrocinador: req.user.enlace_afiliado },
        { perfil: { [Op.ne]: "superdistribuidor" } },
        { email: { [Op.ne]: "sergio27chanona@gmail.com" } },
      ],
    },
  });
  const distribuidores = await Usuarios.findAll();
  const plataformas = await Plataformas.findAll({
    where: {
      [Op.and]: [{ estado: 1 }, { id_superdistribuidor: req.user.id_usuario }],
    },
  });

  res.render("dashboard/adminUsuariosSuperdistribuidor", {
    nombrePagina: "Administrador Usuarios",
    titulo: "Administrador Usuarios",
    breadcrumb: "Administrador Usuarios",
    classActive: req.path.split("/")[2],
    usuario,
    usuarios,
    plataformas,
    distribuidores,
  });
};

// Cargar saldo
exports.cargarSaldo = async (req, res) => {
  const idUsuario = req.body.id;
  const valorCargar = req.body.valor;
  const usuario = await Usuarios.findOne({ where: { id_usuario: idUsuario } });
  const responsable = req.body.responsable;

  if (responsable === "") {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "Debe llenar todos los campos.",
    });
    return;
  }

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "No es posible cargar saldo a este usuario.",
    });
    return;
  }

  const superdistribuidor = await Usuarios.findOne({
    where: { enlace_afiliado: usuario.super_patrocinador },
  });

  await Cargas.create({
    idCarga: uuid_v4(),
    idSuperdistribuidor: superdistribuidor.id_usuario,
    valor: valorCargar,
    accionCarga: "carga",
    tipoCarga: "carga directa",
    saldoAnterior: usuario.saldo,
    saldoNuevo: Number(usuario.saldo) + Number(valorCargar),
    usuarioIdUsuario: idUsuario,
    responsableGestion: responsable,
  });

  usuario.saldo = Number(usuario.saldo) + Number(valorCargar);
  await usuario.save();

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "El saldo fue cargado con éxito.",
  });
  return;
};

// Restar Saldo
exports.restarSaldo = async (req, res) => {
  const idUsuario = req.body.id;
  const valorCargar = req.body.valor;
  const usuario = await Usuarios.findOne({ where: { id_usuario: idUsuario } });
  const responsable = req.body.responsable;

  if (responsable === "") {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "Debe llenar todos los campos.",
    });
    return;
  }

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "No es posible restar saldo a este usuario.",
    });
    return;
  }

  if (Number(usuario.saldo) < Number(valorCargar)) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion:
        "No es posible restar saldo a este usuario, debido a que el saldo que desea restar es mayor al saldo actual del usuario. El saldo actual del usuario es " +
        usuario.saldo,
    });
    return;
  }

  const superdistribuidor = await Usuarios.findOne({
    where: { enlace_afiliado: usuario.super_patrocinador },
  });

  await Cargas.create({
    idCarga: uuid_v4(),
    idSuperdistribuidor: superdistribuidor.id_usuario,
    valor: valorCargar,
    accionCarga: "restar",
    tipoCarga: "carga directa",
    saldoAnterior: usuario.saldo,
    saldoNuevo: Number(usuario.saldo) - Number(valorCargar),
    usuarioIdUsuario: idUsuario,
    responsableGestion: responsable,
  });

  usuario.saldo = Number(usuario.saldo) - Number(valorCargar);
  await usuario.save();

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "El saldo fue restado con éxito.",
  });
  return;
};

// ============================================================================
//                      Usuarios controller
// ============================================================================

exports.usuariosInformacionPlataformasUsuario = async (req, res) => {
  const idUsuario = req.body.id;
  const asignaciones = await Asignaciones.findAll({
    where: {
      usuarioIdUsuario: idUsuario,
    },
    include: [
      { model: Usuarios, foreignKey: "usuarioIdUsuario" },
      { model: Plataformas, foreignKey: "plataformaIdPlataforma" },
    ],
  });

  return res.json({ data: asignaciones });
};

exports.usuarios = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: { id_usuario: req.user.id_usuario },
  });
  const usuarios = await Usuarios.findAll({
    where: {
      [Op.and]: [{ patrocinador: req.user.enlace_afiliado }],
    },
  });

  const distribuidores = await Usuarios.findAll();
  const plataformas = await Plataformas.findAll({
    where: { estado: 1 },
  });

  res.render("dashboard/usuarios", {
    nombrePagina: "Administrador Usuarios",
    titulo: "Administrador Usuarios",
    breadcrumb: "Administrador Usuarios",
    classActive: req.path.split("/")[2],
    usuario,
    usuarios,
    plataformas,
    distribuidores,
  });
};

// Cargar saldo
exports.cargarSaldoUsuario = async (req, res) => {
  const idUsuario = req.body.id;
  const valorCargar = req.body.valor;
  const usuario = await Usuarios.findOne({ where: { id_usuario: idUsuario } });
  const distribuidor = await Usuarios.findOne({
    where: { id_usuario: req.user.id_usuario },
  });
  const superdistribuidor = await Usuarios.findOne({
    where: { enlace_afiliado: req.user.super_patrocinador },
  });
  const responsable = req.body.responsable;

  if (responsable === "") {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "Debe llenar todos los campos.",
    });
    return;
  }

  const saldoDistribuidor = distribuidor.saldo;
  // Cuadrar quien aprueba la carga de saldo que basicamente es el patrocinador, arreglar las cargas en superdistribuidor
  if (Number(saldoDistribuidor) < Number(valorCargar)) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion:
        "No es posible cargar saldo a este usuario, debido a que tu saldo es inferior al saldo que deseas cargar",
    });
    return;
  }

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "No es posible cargar saldo a este usuario.",
    });
    return;
  }

  distribuidor.saldo = Number(distribuidor.saldo) - Number(valorCargar);
  await distribuidor.save();

  await Cargas.create({
    idCarga: uuid_v4(),
    idSuperdistribuidor: superdistribuidor.id_usuario,
    valor: valorCargar,
    accionCarga: "carga",
    tipoCarga: "carga distribuidor",
    saldoAnterior: usuario.saldo,
    saldoNuevo: Number(usuario.saldo) + Number(valorCargar),
    usuarioIdUsuario: idUsuario,
    responsableGestion: responsable,
  });

  usuario.saldo = Number(usuario.saldo) + Number(valorCargar);
  await usuario.save();

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "El saldo fue cargado con éxito.",
  });
  return;
};

// Restar Saldo
exports.restarSaldoUsuario = async (req, res) => {
  const idUsuario = req.body.id;
  const valorCargar = req.body.valor;
  const usuario = await Usuarios.findOne({ where: { id_usuario: idUsuario } });
  const distribuidor = await Usuarios.findOne({
    where: { id_usuario: req.user.id_usuario },
  });
  const superdistribuidor = await Usuarios.findOne({
    where: { enlace_afiliado: req.user.super_patrocinador },
  });
  const responsable = req.body.responsable;

  if (responsable === "") {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "Debe llenar todos los campos.",
    });
    return;
  }

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "No es posible restar saldo a este usuario.",
    });
    return;
  }

  if (Number(usuario.saldo) < Number(valorCargar)) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion:
        "No es posible restar saldo a este usuario, debido a que el saldo que desea restar es mayor al saldo actual del usuario. El saldo actual del usuario es " +
        usuario.saldo,
    });
    return;
  }

  distribuidor.saldo = Number(distribuidor.saldo) + Number(valorCargar);
  await distribuidor.save();

  await Cargas.create({
    idCarga: uuid_v4(),
    idSuperdistribuidor: superdistribuidor.id_usuario,
    valor: valorCargar,
    accionCarga: "resta",
    tipoCarga: "carga distribuidor",
    saldoAnterior: usuario.saldo,
    saldoNuevo: Number(usuario.saldo) - Number(valorCargar),
    usuarioIdUsuario: idUsuario,
    responsableGestion: responsable,
  });

  usuario.saldo = Number(usuario.saldo) - Number(valorCargar);
  await usuario.save();

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "El saldo fue restado con éxito.",
  });
  return;
};

// Asignar plataformas
exports.asignarPlataformaUsuario = async (req, res) => {
  const id_usuario = req.body.id.trim();
  const objetoAsignaciones = req.body.asignaciones;

  if (objetoAsignaciones === "" || objetoAsignaciones.length < 1) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion:
        "No es posible asignar las plataformas, debe ingresar algún valor en las casillas.",
    });
    return;
  }

  // datos del usuario a asignar
  const usuario = await Usuarios.findOne({
    where: {
      [Op.and]: [{ id_usuario: id_usuario }, { bloqueo: 0 }],
    },
    attributes: ["patrocinador", "super_patrocinador"],
  });

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion:
        "No es posible asignar las plataformas a este usuario ya que se encuentra bloqueado o no existe en la plataforma",
    });
    return;
  }

  const enlace_distribuidor = usuario.patrocinador;
  const enlace_superdistribuidor = usuario.super_patrocinador;

  // id distribuidor
  const distribuidor = await Usuarios.findOne({
    where: { enlace_afiliado: enlace_distribuidor },
    attributes: ["id_usuario"],
  });
  const idDistribuidor = distribuidor.id_usuario;

  // id superdistribuidor
  const superdistribuidor = await Usuarios.findOne({
    where: { enlace_afiliado: enlace_superdistribuidor },
    attributes: ["id_usuario"],
  });
  const idSuperdistribuidor = superdistribuidor.id_usuario;

  // recorrer array con asignaciones
  for (var i = 0; i < objetoAsignaciones.length; i++) {
    const idPlataforma = objetoAsignaciones[i][0].id;
    console.log("id plataforma:" + idPlataforma);
    console.log("id usuario:" + id_usuario);

    const valorPlataforma = objetoAsignaciones[i][0].valor;
    const valorPlataforma2 = objetoAsignaciones[i][0].valor;

    const asignacionDistribuidor = await Asignaciones.findOne({
      where: {
        [Op.and]: [
          { usuarioIdUsuario: req.user.id_usuario },
          { plataformaIdPlataforma: idPlataforma },
        ],
      },
      attributes: ["valor"],
    });

    let menorValor;
    let resellerDiference;

    const minimusPriceFromDistribuidores = await Asignaciones.findOne({
      where: {
        [Op.and]: [
          { id_distribuidor: id_usuario },
          { plataformaIdPlataforma: idPlataforma },
        ],
      },
      order: [["valor", "ASC"]],
    });

    if (minimusPriceFromDistribuidores) {
      menorValor = minimusPriceFromDistribuidores.valor;
      resellerDiference = false;
    } else {
      menorValor = 100000000000;
      resellerDiference = true;
    }

    if (objetoAsignaciones[i][0].id === "") {
      res.json({
        titulo: "¡Lo Sentimos!",
        resp: "error",
        descripcion: "No has hecho cambios en las plataformas",
      });

      return;
    }

    if (Number(asignacionDistribuidor.valor) > Number(valorPlataforma)) {
      const plataforma = Plataformas.findOne({
        where: {
          id_plataforma: asignacionDistribuidor.plataformaIdPlataforma,
        },
      });
      res.json({
        titulo: "¡Lo Sentimos!",
        resp: "error",
        descripcion: `No es posible asignar el valor a ${plataforma.plataforma} ya es que menor o igual a su valor asignado.`,
      });

      return;
    }

    if (valorPlataforma !== "") {
      const asignacion = await Asignaciones.findOne({
        where: {
          [Op.and]: [
            { usuarioIdUsuario: id_usuario },
            { plataformaIdPlataforma: idPlataforma },
          ],
        },
      });

      const plataforma = await Plataformas.findOne({
        where: {
          id_plataforma: idPlataforma,
        },
        attributes: ["plataforma"],
      });

      const nombrePlataforma = plataforma.plataforma;
      const diferencial = Number(valorPlataforma) - Number(asignacion.valor);

      console.log("Menor valor");
      console.log(menorValor);

      console.log("Diferencial");
      console.log(diferencial);

      console.log("valor plataforma");
      console.log(valorPlataforma);

      if (Number(diferencial) > 1000 && !resellerDiference) {
        res.json({
          titulo: "¡Lo Sentimos!",
          resp: "error",
          descripcion: `No es posible aumentar el valor a la plataforma ${nombrePlataforma} debido a que excede el valor permitido de aumento.`,
        });

        return;
      }

      if (Number(valorPlataforma2) > Number(menorValor)) {
        res.json({
          titulo: "¡Lo Sentimos!",
          resp: "error",
          descripcion: `No es posible aumentar el valor a la plataforma ${nombrePlataforma} debido a que excede el valor permitido de aumento.`,
        });

        return;
      }

      if (asignacion !== null) {
        asignacion.valor = valorPlataforma;
        await asignacion.save();
      } else {
        await Asignaciones.create({
          id_asignacion: uuid_v4(),
          valor: valorPlataforma,
          id_distribuidor: idDistribuidor,
          id_superdistribuidor: idSuperdistribuidor,
          usuarioIdUsuario: id_usuario,
          plataformaIdPlataforma: idPlataforma,
        });
      }
    }
  }

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "Las plataformas se asignaron con éxito al usuario.",
  });
  return;
};

exports.tablaPrecios = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: { id_usuario: req.user.id_usuario },
  });
  const asignaciones = await Asignaciones.findAll({
    where: {
      [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }],
    },
    include: [
      { model: Usuarios, foreignKey: "usuarioIdUsuario" },
      { model: Plataformas, foreignKey: "plataformaIdPlataforma" },
    ],
  });

  res.render("dashboard/tablaPrecios", {
    nombrePagina: "Tabla de precios",
    titulo: "Tabla de precios",
    breadcrumb: "Tabla de precios",
    classActive: req.path.split("/")[2],
    usuario,
    asignaciones,
  });
};

// ============================================================================
//                      Asignaciones controller
// ============================================================================

exports.asignacionesUsuario = async (req, res) => {
  const usuarioAsignaciones = await Usuarios.findOne({
    where: { id_usuario: req.params.id },
  });
  const usuario = await Usuarios.findOne({
    where: { id_usuario: req.user.id_usuario },
  });

  if (usuario.enlace_afiliado !== usuarioAsignaciones.patrocinador) {
    return res.redirect("/dashboard/usuarios");
  }

  const asignaciones = await Asignaciones.findAll({
    where: {
      [Op.and]: [
        { usuarioIdUsuario: req.params.id },
        { id_distribuidor: req.user.id_usuario },
      ],
    },
    include: [{ model: Plataformas, foreignKey: "plataformaIdPlataforma" }],
  });

  res.render("dashboard/asignaciones", {
    nombrePagina: "Asginacion de plataformas",
    titulo: "Asginacion de plataformas",
    breadcrumb: "Asginacion de plataformas",
    classActive: req.path.split("/")[2],
    usuario,
    usuarioAsignaciones,
    asignaciones,
  });
};

exports.adminMediosPago = async (req, res) => {

  // Traer todo los QR  del usuario
  const qrMediosPago = await MediosPago.findAll({
      where: {
          usuarioIdUsuario: req.user.id_usuario
      },
  });

  res.render("dashboard/adminMediosPago", {
    nombrePagina: "Administrador medios de pago",
    titulo: "Administrador medios de pago",
    breadcrumb: "Administrador medios de pago",
    qrMediosPago,  
    classActive: req.path.split("/")[2],
  });
};
//
exports.adminSuscripciones = async (req, res) => {
  const traerDatos = await Suscripciones.findAll();
  res.render("dashboard/adminSuscripciones", {    
    nombrePagina: "Administrador Suscripciones",
    titulo: "Administrador Suscripciones",
    breadcrumb: "Administrador Suscripciones",
    classActive: req.path.split("/")[2],
    traerDatos
  });
};  
exports.traerDatos = async(req, res)=>{
  
}
exports.suscripciones = async (req, res) => { 
  const qrMediosPago = await MediosPago.findAll(); 
  res.render("dashboard/suscripciones", {
    nombrePagina: "Suscripciones",
    titulo: "Suscripciones",
    breadcrumb: "Suscripciones",
    classActive: req.path.split("/")[2],
    qrMediosPago
  });
  console.log(qrMediosPago)
};  
//




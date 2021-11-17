const Usuarios = require("../models/usuariosModelo");

exports.permisosPaginaAdmin = async (req, res, next) => {
  const userPerfil = req.user.perfil;

  if (userPerfil !== "admin") {
    return res.redirect("/dashboard/inicio");
  }

  next();
};

exports.permisosPaginaSuperdistribuidor = async (req, res, next) => {
  const userPerfil = req.user.perfil;

  if (userPerfil !== "superdistribuidor") {
    return res.redirect("/dashboard/inicio");
  }

  next();
};

exports.permisosPaginaUsuario = async (req, res, next) => {
  const userPerfil = req.user.perfil;

  if (!(userPerfil == "distribuidor" || userPerfil == "reseller")) {
    return res.redirect("/dashboard/inicio");
  }

  next();
};

exports.permisosPaginaDistribuidor = async (req, res, next) => {
  const userPerfil = req.user.perfil;

  if (userPerfil !== "distribuidor") {
    return res.redirect("/dashboard/inicio");
  }

  next();
};

exports.permisosPaginaGeneral = async (req, res, next) => {
  const userPerfil = req.user.perfil;

  if (
    !(
      userPerfil == "superdistribuidor" ||
      userPerfil == "distribuidor" ||
      userPerfil == "reseller"
    )
  ) {
    return res.redirect("/dashboard/inicio");
  }

  next();
};

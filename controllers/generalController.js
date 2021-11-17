const Usuarios = require("../models/usuariosModelo");
const { Op } = require("sequelize");
const { body, validationResult } = require("express-validator");
const enviarEmails = require("../handlers/emails");
const axios = require("axios");
const generator = require("generate-password");
const bcrypt = require("bcrypt-nodejs");
const multer = require("multer");
const shortid = require("shortid");
const { v4: uuid_v4 } = require("uuid");
const { s3, bucket } = require("../config/awsS3");
const multerS3 = require("multer-s3");

exports.inicio = (req, res) => {
  res.render("inicio", {
    nombrePagina: "Inicio",
  });
};

exports.formRegistro = (req, res) => {
  res.render("registro", {
    nombrePagina: "Registro",
  });
};

const configuracionMulter = {
  storage: multerS3({
    s3,
    bucket,
    acl: "public-read",
    metadata: (req, file, next) => {
      next(null, {
        filename: file.fieldname,
      });
    },
    key: (req, file, next) => {
      next(null, `il_salone/documentos_comercios/${file.originalname}`);
    },
  }),
};

// Subir un archivo
exports.uploadArchivo = async (req, res, next) => {
  upload(req, res, function (error) {
    if (error) {
      res.json({ titulo: "¡Lo Sentimos!", resp: "error", descripcion: error });
      return;
    } else {
      next();
    }
  });
};

exports.validarRegistro = async (req, res, next) => {
  // leer datos
  const usuario = req.body;

  // Nueva validacion express validator

  if (usuario.password.length < 10) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "El password debe tener al menos 10 carácteres",
    });
    return;
  }

  if (usuario.password === "" || usuario.email === "" || usuario.name === "") {
    return res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "Todos los campos son obligatorios",
    });
  }

  const email = usuario.email;
  const enlace_afiliado = usuario.enlace_afiliado;
  const partner = usuario.partner;

  const userExist = await Usuarios.findOne({
    where: {
      email: email,
    },
  });
  const partnerExist = await Usuarios.findOne({
    where: {
      enlace_afiliado: partner,
    },
  });

  if (partner === "") {
    usuario.partner = "codigoAdmin";
  } else if (partnerExist) {
  } else {
    return res.json({
      titulo: "¡Lo Sentimos!",
      resp: "warning",
      descripcion: "No se encuentra el codigo de afiliacion",
    });
  }

  if (userExist) {
    console.log("hola" + userExist);
    return res.json({
      titulo: "¡Lo Sentimos!",
      resp: "warning",
      descripcion:
        "El usuario ya se encuentra registrado en nuestra plataforma",
    });
  }

  next();

  //si toda la validacion es correcta
};

exports.crearRegistro = async (req, res) => {
  const usuario = req.body;
  const response = await axios.get("https://api.ipify.org?format=json");
  const ip = response.data.ip;

  try {
//aprender: .cra
    await Usuarios.create({
      usuarios: usuario.usuarios,
      email: usuario.email,
      password: usuario.password,
      ip: ip,
      perfil: "users",
      partner: usuario.partner,
      enlace_afiliado: usuario.enlace_afiliado,
    });

    // URL confirmacion
    const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

    // Enviar email
    await enviarEmails.enviarEmail({
      usuario,
      url,
      subject: "Confirma tu cuenta de Capza",
      archivo: "confirmar-cuenta",
    });

    // Todo: flash message y redireccionar
    return res.json({
      titulo: "¡Muy bien!",
      resp: "success",
      descripcion: "Te hemos enviado un E-mail para confirmar tu cuenta",
    });
    // console.log('creando usuario');
  } catch (error) {
    console.log(error);
    const erroresSequelize = error.errors.map((err) => err.message);

    return res.json({
      titulo: "¡Lo Sentimos!",
      resp: "warning",
      descripcion: erroresSequelize,
    });
  }
};

exports.recuperarPasswords = async (req, res) => {
  const email = req.body.emailRecuperar.trim();

  const usuario = await Usuarios.findOne({ where: { email: email } });

  if (!usuario) {
    res.json({
      titulo: "¡Lo Sentimos!",
      resp: "error",
      descripcion: "El email ingresado no existe en nuestra base de datos.",
    });
    return;
  }

  // NewPassword
  const newPassword = generator.generate({
    length: 12,
    numbers: true,
  });

  const hashPassword = bcrypt.hashSync(
    newPassword,
    bcrypt.genSaltSync(10),
    null
  );

  usuario.password = hashPassword;
  await usuario.save();

  // Enviar email
  await enviarEmails.enviarEmailPassword({
    usuario: email,
    newPassword,
    subject: "Recuperar contraseña Capza",
    archivo: "recuperar-password",
  });

  res.json({
    titulo: "¡Que bien!",
    resp: "success",
    descripcion: "Te hemos enviado un E-mail para restablecer tu contraseña.",
  });
  return;
};

// confirmar la cuenta del ususario

exports.confirmarCuenta = async (req, res, next) => {
  // verificar usuario existe
  const usuario = await Usuarios.findOne({
    where: { email: req.params.correo },
  });

  // si no existe redireccionar
  if (!usuario) {
    req.flash(
      "warning",
      "El usuario " + req.params.correo + " no existe en nuestra plataforma"
    );
    res.redirect("/registro");
    return next();
  }

  // si existe confirmar cuenta y redireccionar
  usuario.verificacion = 1;
  await usuario.save();

  req.flash(
    "success",
    "La cuenta se ha confirmado con éxito, ya puedes iniciar sesión"
  );

  res.redirect("/ingreso");
};

exports.formIngreso = (req, res) => {
  res.render("ingreso", {
    nombrePagina: "Ingreso",
  });
};

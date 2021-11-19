const Sequelize = require("sequelize");
const db = require("../config/db");
const bcrypt = require("bcrypt-nodejs");
const { v4: uuid_v4 } = require("uuid");

const superUser = "cristian-cavanzo-239";
const Usuarios = db.define(
  "usuarios",
  {
    id_usuario: {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false, 
      defaultValue: Sequelize.UUIDV4,
    },
    perfil: {
      type: Sequelize.STRING(20),
      defaultValue: "user",
    },
    usuarios: {
      type: Sequelize.STRING(80),
      validate: {
        notEmpty: {
          msg: "El nombre no puede estar vacio",
        },
      },
    },
    email: {
      type: Sequelize.STRING(100),
      defaultValue: null,
      unique: {
        args: true,
        msg: "El email ya está en uso",
      },
      validate: {
        isEmail: { msg: "Por favor ingrese un correo valido" },
      },
    },
    password: {
      type: Sequelize.STRING(70),
      defaultValue: null,
      validate: {
        notEmpty: {
          msg: "El password no puede ser vacio",
        },
      },
    },
    verificacion: {
      type: Sequelize.STRING(20),
      defaultValue: 0,
    },
    partner: {
      type: Sequelize.STRING(20),
      defaultValue: superUser,
    },
    enlace_afiliado: {
      type: Sequelize.STRING(80),
      defaultValue: 0,
    },
    telefono_movil: {
      type: Sequelize.STRING(20),
      defaultValue: null,
    },
    foto: {
      type: Sequelize.STRING(250),
      defaultValue: null,
    },
    suscripcion: {
      type: Sequelize.INTEGER(1),
      defaultValue: 0,
    },
    bloqueo: {
      type: Sequelize.INTEGER(1),
      defaultValue: 0,
    },
    fechaSuscripcion: {
      type: Sequelize.DATE,
      defaultValue: null,
    },
    fechaVencimiento: {
      type: Sequelize.DATE,
      defaultValue: null,
    },
    fechaCreacion: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW,
    },
    ip: {
      type: Sequelize.STRING(16),
      defaultValue: null,
    },
  },
  {
    // tableName: 'usuarios',
    hooks: {
      beforeCreate(usuario) {
        usuario.password = bcrypt.hashSync(
          usuario.password,
          bcrypt.genSaltSync(10),
          null
        );
      },
    },
  }
);

// Metodo para comparar los passwords
Usuarios.prototype.validarPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = Usuarios;

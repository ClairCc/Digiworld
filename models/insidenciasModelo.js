const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo');
const Plataformas = require('./plataformasModelo');

const Insidencias = db.define('insidencias', {
    idInsidencia: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    idSuperdistribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue : null
    },
    asunto: {
        type: Sequelize.STRING(70),
        defaultValue : null
    },
    descripcion: {
        type: Sequelize.TEXT,
        defaultValue : null
    },
    respuesta: {
        type: Sequelize.TEXT,
        defaultValue : null
    },
    estado: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0,
        allowNull: true
    },
    imagen: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },

});

Usuarios.hasOne(Insidencias, {
    foreignKey: {
      name: 'usuarioIdUsuario'
    }
  });
Insidencias.belongsTo(Usuarios);
Plataformas.hasOne(Insidencias, {
    foreignKey: {
      name: 'plataformaIdPlataforma'
    }
  });
Insidencias.belongsTo(Plataformas);

module.exports = Insidencias;
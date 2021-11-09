const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo');

const LinksPse = db.define('linksPse', {
    idLink: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    idSuperdistribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue : null
    },
    link: {
        type: Sequelize.STRING(70),
        defaultValue : null
    },
    valor: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue : 0.00
    },
    estado: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0,
        allowNull: true
    },
    fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },

});

Usuarios.hasOne(LinksPse, {
    foreignKey: {
      name: 'usuarioIdUsuario'
    }
  });
LinksPse.belongsTo(Usuarios);

module.exports = LinksPse;
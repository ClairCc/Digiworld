const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo');
const Plataformas = require('./plataformasModelo');

const Ganancias = db.define('gananciasVentas', {
    idGanancia: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    ganancia: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue : 0.00
    },
    fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    distribuidor: {
        type: Sequelize.CHAR(36),
        defaultValue : null
    },

});

Usuarios.hasOne(Ganancias, {
    foreignKey: {
      name: 'usuarioIdUsuario'
    }
  });
Ganancias.belongsTo(Usuarios);
Plataformas.hasOne(Ganancias, {
    foreignKey: {
    name: 'plataformaIdPlataforma'
    }
});
Ganancias.belongsTo(Plataformas);

module.exports = Ganancias;
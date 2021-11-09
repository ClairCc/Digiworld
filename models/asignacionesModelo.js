const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo');
const Plataformas = require('./plataformasModelo');

const Asignaciones = db.define('asignacionPlataformas', {
    id_asignacion: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    valor: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue : 0.00
    },
    id_distribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue: null
    },
    id_superdistribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue: null
    }

});

Usuarios.hasOne(Asignaciones, {
  foreignKey: {
    name: 'usuarioIdUsuario'
  }
});
Asignaciones.belongsTo(Usuarios);
Plataformas.hasOne(Asignaciones, {
    foreignKey: {
      name: 'plataformaIdPlataforma'
    }
  });
Asignaciones.belongsTo(Plataformas);

module.exports = Asignaciones;
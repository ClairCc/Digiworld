const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo');

const Cargas = db.define('cargasSaldo', {
    idCarga: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    idSuperdistribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue : null
    },
    valor: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue : 0.00
    },
    accionCarga: {
        type: Sequelize.STRING(30),
        defaultValue : null
    },
    tipoCarga: {
        type: Sequelize.STRING(30),
        defaultValue : null
    },
    responsableGestion: {
        type: Sequelize.STRING(90),
        defaultValue : null
    },
    saldoAnterior: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue : 0.00
    },
    saldoNuevo: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue : 0.00
    },
    fechaCarga: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }

});

Usuarios.hasOne(Cargas, {
    foreignKey: {
      name: 'usuarioIdUsuario'
    }
  });
Cargas.belongsTo(Usuarios);

module.exports = Cargas;
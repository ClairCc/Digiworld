const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo');
const Plataformas = require('./plataformasModelo');

const Cuentas = db.define('cuentasSubidas', {
    idCuenta: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    idDistribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue : null
    },
    idSuperdistribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue : null
    },
    user: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    password: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    pantalla: {
        type: Sequelize.STRING(50),
        defaultValue : null
    },
    pin: {
        type: Sequelize.STRING(50),
        defaultValue : null
    },
    idJuego: {
        type: Sequelize.STRING(50),
        defaultValue : null
    },
    comprobanteJuego: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    estado: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0,
        allowNull: true
    },
    tipoCuenta: {
        type: Sequelize.INTEGER(1),
        defaultValue : null,
        allowNull: true
    },
    valorPagado: {
        type: Sequelize.DECIMAL(20, 2),
        defaultValue : 0.00
    },
    cliente: {
        type: Sequelize.STRING(50),
        defaultValue : null
    },
    telefono: {
        type: Sequelize.STRING(50),
        defaultValue : null
    },
    fechaSubida: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    fechaCompra: {
        type: Sequelize.DATE,
        defaultValue: null
    }

});

Usuarios.hasOne(Cuentas, {
    foreignKey: {
      name: 'usuarioIdUsuario'
    }
  });
Cuentas.belongsTo(Usuarios);
Plataformas.hasOne(Cuentas, {
    foreignKey: {
    name: 'plataformaIdPlataforma'
    }
});
Cuentas.belongsTo(Plataformas);

module.exports = Cuentas;
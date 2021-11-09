const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo');

const Consignaciones = db.define('consignaciones', {
    idConsignacion: {
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
    responsableGestion: {
        type: Sequelize.STRING(90),
        defaultValue : null
    },
    estado: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0,
        allowNull: true
    },
    fechaHoraConsignacion: {
        type: Sequelize.DATE,
        defaultValue: null
    },
    tipoConsignacion: {
        type: Sequelize.STRING(30),
        defaultValue : null
    },
    referencia: {
        type: Sequelize.STRING(50),
        defaultValue : null
    },
    celularConsignacion: {
        type: Sequelize.STRING(50),
        defaultValue : null
    },
    comprobante: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    observaciones: {
        type: Sequelize.STRING(1200),
        defaultValue : null
    },
    fecha: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }

});

Usuarios.hasOne(Consignaciones, {
    foreignKey: {
      name: 'usuarioIdUsuario'
    }
  });
Consignaciones.belongsTo(Usuarios);

module.exports = Consignaciones;
const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo')


const Suscripciones = db.define("suscripciones",{
    idSuscripcion: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    fechaSuscripcion:{
        type: Sequelize.DATE,
        defaultValue: null,
    },
    comprobante:{
        type: Sequelize.STRING(100),
        defaultValue: null,
    },
    ip:{
        type: Sequelize.STRING(16),
      defaultValue: null,
    },
    estado:{
        type:Sequelize.BOOLEAN
    }
    
})

Usuarios.hasOne(Suscripciones, {
    foreignKey: {
      name: 'usuarioIdUsuario'
    }
});
Suscripciones.belongsTo(Usuarios);

module.exports = Suscripciones
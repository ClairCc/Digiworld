const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo')


const Suscripciones = db.define("suscripciones",{
    idSuscripcion: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
    },
    fechaSuscripcion:{
        type: Sequelize.DATE,
        defaultValue: null,
    },
    nombreWallet:{
        type: Sequelize.STRING(100),
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
        type:Sequelize.BOOLEAN,
        defaultValue: 0,
    }
    
})


Usuarios.hasOne(Suscripciones, {
     foreignKey: {
      name: 'usuarioIdUsuario'
     }
});
Suscripciones.belongsTo(Usuarios);

module.exports = Suscripciones
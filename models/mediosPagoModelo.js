const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');
const Usuarios = require('./usuariosModelo')

const MediosPago = db.define("mediosPago",{
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    nombre:{
        type: Sequelize.STRING(80),
        defaultValue: null
    },
    wallet:{
        type: Sequelize.STRING(150),
        defaultValue: null
    },
    codigoQR:{
        type: Sequelize.STRING(8000),
        defaultValue: null
    }
})

//has one relacion entre tablas
//estudiar

Usuarios.hasOne(MediosPago, {
    foreignKey: {
      name: 'usuarioIdUsuario'
    }
});
MediosPago.belongsTo(Usuarios);

module.exports = MediosPago
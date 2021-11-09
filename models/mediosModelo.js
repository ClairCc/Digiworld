const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');

const Medios = db.define('mediosConsignacion', {
    idMedio: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    idSuperdistribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue : null
    },
    titulo: {
        type: Sequelize.STRING(100),
        defaultValue : null
    },
    descripcionCorta: {
        type: Sequelize.STRING(100),
        defaultValue : null
    },
    descripcion: {
        type: Sequelize.STRING(3000),
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
    recurso: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },

});

module.exports = Medios;
const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');

const Publicidad = db.define('publicidadRed', {
    idPublicidad: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    idSuperdistribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue : null
    },
    imagen: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    tipo: {
        type: Sequelize.STRING(70),
        defaultValue : null
    }

});

module.exports = Publicidad;
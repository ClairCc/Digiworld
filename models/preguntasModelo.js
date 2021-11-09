const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');

const Preguntas = db.define('preguntasFrecuentes', {
    idPregunta: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    idSuperdistribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue : null
    },
    pregunta: {
        type: Sequelize.STRING(120),
        defaultValue : null
    },
    video: {
        type: Sequelize.STRING(70),
        defaultValue : null
    }

});

module.exports = Preguntas;
const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');

const Plataformas = db.define('plataformas', {
    id_plataforma: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    id_superdistribuidor: {
        type: Sequelize.INTEGER(11),
        defaultValue : null
    },
    plataforma: {
        type: Sequelize.STRING(30),
        defaultValue : null,
        validate: {
            notEmpty: {
                msg: 'El nombre de la plataforma no puede ser vacio'
            }
        }
    },
    tipo_plataforma: {
        type: Sequelize.INTEGER(1),
        defaultValue : null,
        allowNull: true
    },
    estado: {
        type: Sequelize.INTEGER(1),
        defaultValue : 1
    },
    logo: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    descripcion: {
        type: Sequelize.STRING(3000),
        defaultValue : null
    }

});

module.exports = Plataformas;
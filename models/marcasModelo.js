const Sequelize = require('sequelize');
const db = require('../config/db');
const { v4: uuid_v4 } = require('uuid');

const Marcas = db.define('marcaBlanca', {
    id_marca: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    nombre_marca: {
        type: Sequelize.STRING(30),
        defaultValue : null,
        validate: {
            notEmpty: {
                msg: 'El nombre de la marca no puede ser vacio'
            }
        }
    },
    url: {
        type: Sequelize.STRING(60),
        defaultValue : null,
        allowNull: true
    },
    estado: {
        type: Sequelize.INTEGER(1),
        defaultValue : 1
    },
    icono: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    logo: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    iconoBlanco: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    logoBlanco: {
        type: Sequelize.STRING(250),
        defaultValue : null
    }

});

module.exports = Marcas;
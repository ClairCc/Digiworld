const Sequelize = require('sequelize');
const db = require('../config/db');
const bcrypt = require('bcrypt-nodejs');
const { v4: uuid_v4 } = require('uuid');

const Usuarios = db.define('usuarios', {
    id_usuario: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: uuid_v4()
    },
    perfil: {
        type: Sequelize.STRING(20),
        defaultValue : null
    },
    nombre: {
        type: Sequelize.STRING(80),
        defaultValue : null,
        validate: {
            notEmpty: {
                msg: 'El nombre no puede ser vacio'
            }
        }
    },
    razonSocial: {
        type: Sequelize.STRING(80),
        defaultValue : null,
        validate: {
            notEmpty: {
                msg: 'La razón social no puede ser vacia'
            }
        }
    },
    nit: {
        type: Sequelize.STRING(11),
        defaultValue : null,
        validate: {
            notEmpty: {
                msg: 'El Nit no puede ser vacio'
            }
        }
    },
    email: {
        type: Sequelize.STRING(100),
        defaultValue : null,
        unique: {
            args: true,
            msg: 'El email ya está en uso'
        },
        validate: {
            isEmail: { msg: 'Por favor ingrese un correo valido' }
        }
    },
    password: {
        type: Sequelize.STRING(70),
        defaultValue : null,
        validate: {
            notEmpty: {
                msg: 'El password no puede ser vacio'
            }
        }
    },
    telefono_movil: {
        type: Sequelize.STRING(20),
        defaultValue : null
    },
    direccion: {
        type: Sequelize.STRING(70),
        defaultValue : null
    },
    foto: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    suscripcion: {
        type: Sequelize.INTEGER(1),
        defaultValue : 1
    },
    bloqueo: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0
    },
    aprobacion: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0
    },
    verificacion: {
        type: Sequelize.INTEGER(1),
        defaultValue : 0
    },
    facebook: {
        type: Sequelize.STRING(100),
        defaultValue : null
    },
    instagram: {
        type: Sequelize.STRING(100),
        defaultValue : null
    },
    tiktok: {
        type: Sequelize.STRING(100),
        defaultValue : null
    },
    tiwtter: {
        type: Sequelize.STRING(100),
        defaultValue : null
    },
    camaraComercio: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    rut: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    documentoIdentidad: {
        type: Sequelize.STRING(250),
        defaultValue : null
    },
    fechaSuscripcion: {
        type: Sequelize.DATE,
        defaultValue: null
    },
    fechaVencimiento: {
        type: Sequelize.DATE,
        defaultValue: null
    },
    fechaCreacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    ip: {
        type: Sequelize.STRING(16),
        defaultValue : null
    },

},{ 
    // tableName: 'usuarios',
    hooks: {
        beforeCreate(usuario) {
            usuario.password = bcrypt.hashSync(usuario.password,
                bcrypt.genSaltSync(10), null);
        }
    }
});

// Metodo para comparar los passwords
Usuarios.prototype.validarPassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

module.exports = Usuarios;
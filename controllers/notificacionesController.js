const Usuarios = require('../models/usuariosModelo');
const Plataformas = require('../models/plataformasModelo');
const Asignaciones = require('../models/asignacionesModelo');
const Cuentas = require('../models/cuentasModelo');
const Ganancias = require('../models/gananciasModelo');
const Consignaciones = require('../models/consignacionesModelo');
const LinksPse = require('../models/linksPseModelo');
const Incidencias = require('../models/insidenciasModelo');

const { Op } = require("sequelize");
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');

exports.notificacionesUsuario = async (req, res) => {

    if(req.user.perfil === 'superdistribuidor') {

        const cuentasBajoPedido = await Cuentas.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 2 }]
            },
            order: [['fechaSubida', 'DESC']],
            limit: 2,
        });

        const cuentasPersonalizadas = await Cuentas.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 3 }]
            },
            order: [['fechaSubida', 'DESC']],
            limit: 2,
        });
    
        const cuentasRenovaciones = await Cuentas.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 4 }]
            },
            order: [['fechaSubida', 'DESC']],
            limit: 2,
        });
    
        const cuentasJuegos = await Cuentas.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 5 }]
            },
            order: [['fechaSubida', 'DESC']],
            limit: 2,
        });

        const consignaciones = await Consignaciones.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }]
            },
            limit: 2,
        });

        const linksPse = await LinksPse.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }]
            },
            limit: 2,
        });

        const incidencias = await Incidencias.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }]
            },
            limit: 2,
        });

        // Counts
    
        const countBajoPedido = await Cuentas.count({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 2 }],
                usuarioIdUsuario: {
                    [Op.ne]: null
                }
            },
        });
    
        const countPersonalizadas = await Cuentas.count({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 3 }],
                usuarioIdUsuario: {
                    [Op.ne]: null
                }
            },
        });
    
        const countRenovaciones = await Cuentas.count({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 4 }],
                usuarioIdUsuario: {
                    [Op.ne]: null
                }
            },
        });
    
        const countJuegos = await Cuentas.count({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 5 }]
            },
        });

        const countConsignaciones = await Consignaciones.count({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }]
            },
        });

        const countLinksPse = await LinksPse.count({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }]
            },
        });

        const countIncidencias = await Incidencias.count({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, { estado: 0 }]
            },
        });
    
        const plataformas = await Plataformas.findAll({
            where: {
                [Op.and]: [{estado: 1}, {id_superdistribuidor: req.user.id_usuario}]
            }
        });

        res.json({
            incidencias: incidencias, 
            pse: linksPse, 
            bajoPedido: cuentasBajoPedido, 
            personalizadas: cuentasPersonalizadas, 
            renovaciones: cuentasRenovaciones, 
            juegos: cuentasJuegos, 
            consignaciones: consignaciones, 
            plataformas: plataformas, 
            countBajoPedido: countBajoPedido, 
            countPersonalizadas: countPersonalizadas, 
            countRenovaciones: countRenovaciones, 
            countJuegos: countJuegos, 
            p: req.user.perfil, 
            countConsignaciones: countConsignaciones, 
            countIncidencias: countIncidencias, 
            countLinksPse: countLinksPse
        });
        return;

    } else {

        const superDistribuidor = await Usuarios.findOne({
            where: {
                [Op.and]: [{enlace_afiliado: req.user.super_patrocinador}]
            }
        });

        const cuentasBajoPedido = await Cuentas.findAll({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { tipoCuenta: 2 }]
            },
            order: [['fechaSubida', 'DESC']],
            limit: 2,
        });
    
        const cuentasPersonalizadas = await Cuentas.findAll({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { tipoCuenta: 3 }]
            },
            order: [['fechaSubida', 'DESC']],
            limit: 2,
        });
    
        const cuentasRenovaciones = await Cuentas.findAll({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { tipoCuenta: 4 }]
            },
            order: [['fechaSubida', 'DESC']],
            limit: 2,
        });
    
        const cuentasJuegos = await Cuentas.findAll({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { tipoCuenta: 5 }]
            },
            order: [['fechaSubida', 'DESC']],
            limit: 2,
        });

        const consignaciones = await Consignaciones.findAll({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}]
            },
            limit: 2,
        });

        const linksPse = await LinksPse.findAll({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}]
            },
            limit: 2,
        });

        const incidencias = await Incidencias.findAll({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}]
            },
            limit: 2,
        });

        // Counts
    
        const countBajoPedido = await Cuentas.count({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 2 }]
            },
        });
    
        const countPersonalizadas = await Cuentas.count({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 3 }]
            },
        });
    
        const countRenovaciones = await Cuentas.count({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 4 }]
            },
        });
    
        const countJuegos = await Cuentas.count({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { estado: 0 }, { tipoCuenta: 5 }]
            },
        });

        const countConsignaciones = await Consignaciones.count({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { estado: 0 }]
            },
        });

        const countLinksPse = await LinksPse.count({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { estado: 0 }]
            },
        });

        const countIncidencias = await Incidencias.count({
            where: {
                [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, { estado: 0 }]
            },
        });
    
        const plataformas = await Plataformas.findAll({
            where: {
                [Op.and]: [{estado: 1}, {id_superdistribuidor: superDistribuidor.id_usuario}]
            }
        });

        res.json({incidencias: incidencias, pse: linksPse, bajoPedido: cuentasBajoPedido, personalizadas: cuentasPersonalizadas, renovaciones: cuentasRenovaciones, juegos: cuentasJuegos, consignaciones: consignaciones, plataformas: plataformas, countBajoPedido: countBajoPedido, countPersonalizadas: countPersonalizadas, countRenovaciones: countRenovaciones, countJuegos: countJuegos, p: req.user.perfil, countConsignaciones: countConsignaciones, countIncidencias: countIncidencias, countLinksPse: countLinksPse});
        return;
    }


}
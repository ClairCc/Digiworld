const Usuarios = require('../models/usuariosModelo');
const Plataformas = require('../models/plataformasModelo');
const Cuentas = require('../models/cuentasModelo');
const Asignaciones = require('../models/asignacionesModelo');
const Ganancias = require('../models/gananciasModelo');
const { Op } = require("sequelize");
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const fs = require('fs');
const xlsx = require('node-xlsx');
const path = require('path');
const dotenv = require('dotenv');

// Inicio
exports.ganancias = async (req, res) => {
    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});

    const ganancias = await Ganancias.findAll({
        where: {
            [Op.and]: [{distribuidor: req.user.id_usuario}]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
            {model: Plataformas, foreignKey: 'plataformaIdPlataforma'}
        ],
        order: [['fecha', 'DESC']]
    });

    const distribuidor = await Usuarios.findAll({ where: { super_patrocinador: req.user.enlace_afiliado }});
    const usuarios = await Usuarios.findAll({ where: { super_patrocinador: req.user.enlace_afiliado }});

    res.render('dashboard/ganancias', {
        nombrePagina : 'Ganancias Red',
        titulo: 'Ganancias Red',
        breadcrumb: 'Ganancias Red',
        classActive: req.path.split('/')[2],
        usuario,
        usuarios,
        ganancias,
        distribuidor
    })
}

exports.gananciasRed = async (req, res) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});

    const ganancias = await Ganancias.findAll({
        where: {
            [Op.and]: [{distribuidor: req.user.id_usuario}]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
            {model: Plataformas, foreignKey: 'plataformaIdPlataforma'}
        ],
        order: [['fecha', 'DESC']]
    });

    const usuarios = await Usuarios.findAll({ where: { super_patrocinador: req.user.super_patrocinador }});

    res.render('dashboard/gananciasRed', {
        nombrePagina : 'Ganancias Red',
        titulo: 'Ganancias Red',
        breadcrumb: 'Ganancias Red',
        classActive: req.path.split('/')[2],
        usuario,
        ganancias,
        usuarios
    })

}
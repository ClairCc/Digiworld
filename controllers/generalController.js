const Usuarios = require('../models/usuariosModelo');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const enviarEmails = require('../handlers/emails');
const axios = require('axios');
const generator = require('generate-password');
const bcrypt = require('bcrypt-nodejs');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const { s3, bucket } = require('../config/awsS3');
const multerS3 = require('multer-s3');
const Servicios = require('../models/suscripcionesModelo');

exports.inicio = (req, res) => {
    res.render('inicio', {
        nombrePagina: 'Inicio',
    });
};
exports.home = (req, res) => {
    res.render('home', {
        nombrePagina: 'home',
    });
};

exports.nosotros = (req, res) => {
    res.render('nosotros', {
        nombrePagina: 'Nosotros',
    });
};

exports.desarrollo = (req, res) => {
    res.render('desarrollo', {
        nombrePagina: 'desarrollo',
    });
};
exports.contacto = (req, res) => {
    res.render('contacto', {
        nombrePagina: 'contacto',
    });
};

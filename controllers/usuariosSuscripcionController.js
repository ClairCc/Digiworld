const { Op } = require("sequelize");
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const QRCode = require('qrcode');
const MediosPago = require("../models/mediosPagoModelo");
const Usuarios = require("../models/usuariosModelo");


exports.qrSuscripciones = async (req, res) =>{
    
}

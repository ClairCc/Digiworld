const Usuarios = require('../models/usuariosModelo');
const Publicidad = require('../models/publicidadModelo');
const { Op, and } = require("sequelize");
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const fs = require('fs');
const xlsx = require('node-xlsx');
const { request } = require('http');
const { s3, bucket } = require('../config/awsS3');
const multerS3 = require('multer-s3');

// Inicio
exports.adminPublicidad = async (req, res) => {

    const publicidad = await Publicidad.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }]
        }
    });

    res.render('dashboard/adminPublicidad', {
        nombrePagina: 'Administrar publicidad',
        titulo: 'Administrar publicidad',
        breadcrumb: 'Administrar publicidad',
        classActive: req.path.split('/')[2],
        publicidad
    })
}

const configuracionMulter = ({
    storage: multerS3({
        s3,
        bucket,
        acl: 'public-read',
        metadata: (req, file, next) => {
            next(null, {
                filename: file.fieldname
            });
        },
        key: (req, file, next) => {
            console.log(file);
            next(null, `il_salone/pautas/${file.originalname}`);
        }
    })
});

const upload = multer(configuracionMulter).single('files');

exports.uploadPauta = async (req, res, next) => {

    upload(req, res, function (error) {
        if (error) {
            res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Hubo un error con el archivo que desea subir.' });
            return;
        } else {
            next();
        }
    })
}

exports.subirPauta = async (req, res) => {

    if (!req.file) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir una imagen.' });
        return;
    }

    if (req.file.location === 'undefined' || req.file.location === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir una imagen.' });
        return;
    }

    const imgPauta = req.file.location;
    const tipo = req.body.tipo;

    if (tipo === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe seleccionar un tipo de pauta.' });
        return;
    }

    try {

        await Publicidad.create({
            idPublicidad: uuid_v4(),
            idSuperdistribuidor: req.user.id_usuario,
            imagen: imgPauta,
            tipo: tipo
        });

        res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Pauta creada con éxito.' });
        return;

    } catch (error) {
        // console.log(error);
        res.json({ titulo: '¡Lo sentimos!', resp: 'error', descripcion: error.message });
        return;
    }

}

exports.eliminarPauta = async (req, res) => {

    const id = req.body.id.trim();

    const pauta = await Publicidad.findOne({
        where: {
            [Op.and]: [{ idPublicidad: id }]
        }
    })

    // Eliminar imagenes
    fs.unlink(__dirname + '/../public/uploads/pautas/' + pauta.imagen, () => {
    })

    await Publicidad.destroy({ where: { idPublicidad: id } });

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Pauta eliminada con éxito.' });
    return;

}
const Usuarios = require('../models/usuariosModelo');
const Medios = require('../models/mediosModelo');
const { Op } = require("sequelize");
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const fs = require('fs');
const {s3, bucket} = require('../config/awsS3');
const multerS3 = require('multer-s3');

exports.mediosConsignacion = async (req,res) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});
    const medios = await Medios.findAll({ 
        where: {
            [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}]
        }
    });

    res.render('dashboard/mediosConsignacion', {
        nombrePagina : 'Medios de consignación',
        titulo: 'Medios de consignación',
        breadcrumb: 'Medios de consignación',
        classActive: req.path.split('/')[2],
        usuario,
        medios
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
            next(null, `il_salone/medios/${file.originalname}`);
        }
    })
});

const upload = multer(configuracionMulter).any('imagen', 'recurso');

exports.uploadRecursos = async (req, res, next) => {

    upload(req, res, function(error) {
        if(error){
            res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Hubo un error con el archivo que desea subir en logo' });
            return;
        } else {
            next();
        }
    })
}

exports.subirMedio = async (req, res) => {
    console.log(req.body.imagen);
    if(req.body.imagen === 'undefined') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Por favor suba todos los recursos ya que son obligatorios.' });
        return;
    }

    const titulo = req.body.tituloMedio.trim();
    const descripcionCorta = req.body.descripcionCortaMedio.trim();
    const descripcion = req.body.descripcionMedio.trim();
    const imagen = req.files[0].location;
    if(req.body.recurso !== 'undefined') {
        var recurso = req.files[1].location;
    } else {
        var recurso = null;
    }

    if(titulo === '' || descripcionCorta === '' || descripcion === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe llenar todos los campos.' });
        return;
    }

    try {
        
        await Medios.create({
            idMedio: uuid_v4(),
            idSuperdistribuidor: req.user.id_usuario,
            titulo: titulo,
            estado: 1,
            descripcionCorta: descripcionCorta,
            descripcion: descripcion,
            imagen: imagen,
            recurso: recurso
        });
    
        res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Medio de consignación creado con éxito.' });
        return;

    } catch (error) {
        console.log(error);
        res.json({ titulo: '¡Lo sentimos!', resp: 'error', descripcion: error.message });
        return; 
    }

}

exports.infoMedio = async (req, res) => {

    const id = req.body.id;

    const medios = await Medios.findOne({ where: { idMedio: id }});

    res.json({ medio: medios });
    return;

}

exports.editarMedio = async (req, res) => {

    const id = req.body.id;
    const titulo = req.body.titulo;
    const descripcionCorta = req.body.descripcionCorta;
    const descripcion = req.body.descripcion;

    if(id === '' || titulo === '' || descripcionCorta === '' || descripcion === '') {

        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe llenar todos los campos.' });
        return;

    }

    const medio = await Medios.findOne({ 
        where: {
            [Op.and]: [{idMedio: id}]
        }
    });

    medio.titulo = titulo;
    medio.descripcionCorta = descripcionCorta;
    medio.descripcion = descripcion;

    await medio.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Medio de consignación de edito con éxito.' });
    return;

}

exports.bloquearMedio = async (req, res) => {

    const id = req.body.id;

    const medio = await Medios.findOne({ 
        where: {
            [Op.and]: [{idMedio: id}]
        }
    });

    if(medio.estado === 1) {
        var estado = 0;
    } else {
        var estado = 1;
    }

    medio.estado = estado;

    await medio.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'El estado del medio de consignación se actualizo con éxito.' });
    return;

}

exports.eliminarMedio = async (req, res) => {

    const id = req.body.id;

    const medio = await Medios.findOne({ 
        where: {
            [Op.and]: [{idMedio: id}]
        }
    });

    if(!medio) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible eliminar el medio de consignación.' });
        return;
    }

    // Eliminar imagenes
    fs.unlink(__dirname + '/../public/uploads/medios/' + medio.imagen, () => {
        console.log('imagen removida')
    })

    fs.unlink(__dirname + '/../public/uploads/medios/' + medio.recurso, () => {
        console.log('recurso removido')
    })

    await medio.destroy({ where: {idMedio: id}});

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'El medio de consignación se elimino con éxito.' });
    return;

}
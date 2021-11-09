const Usuarios = require('../models/usuariosModelo');
const Insidencias = require('../models/insidenciasModelo');
const Plataformas = require('../models/plataformasModelo');
const { Op } = require("sequelize");
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const {s3, bucket} = require('../config/awsS3');
const multerS3 = require('multer-s3');

exports.reportarInsidencia = async (req, res) => {

    const superdistribuidor = await Usuarios.findOne({ where: { enlace_afiliado: req.user.super_patrocinador }});

    const insidencias = await Insidencias.findAll({ 
        where: { usuarioIdUsuario: req.user.id_usuario },
        order: [['fecha', 'DESC']]
    });

    const plataformas = await Plataformas.findAll({ 
        where: {
            [Op.and]:[{id_superdistribuidor: superdistribuidor.id_usuario}, {estado:1}]
        }
    });

    const countInsidenciasRespondidas = await Insidencias.count({ 
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, {estado: 1}]
        }
    });

    const countInsidenciasNoRespondidas = await Insidencias.count({ 
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, {estado: 0}]
        }
    });

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario }});

    res.render('dashboard/reportarInsidencia', {
        nombrePagina : 'Reportar Insidencia',
        titulo: 'Reportar Insidencia',
        breadcrumb: 'Reportar Insidencia',
        classActive: req.path.split('/')[2],
        usuario,
        insidencias,
        countInsidenciasRespondidas,
        countInsidenciasNoRespondidas,
        plataformas
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
            next(null, `il_salone/insidencias/${file.originalname}`);
        }
    })
});

const upload = multer(configuracionMulter).single('files');

exports.uploadArchivo = async (req, res, next) => {

    upload(req, res, function(error) {
        if(error){
            res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Hubo un error con el archivo que desea subir.' });
            return;
        } else {
            next();
        }
    })
}


exports.crearInsidencia = async (req, res) => {
    
    const asunto = req.body.asunto.trim();
    const idPlataforma = req.body.plataforma.trim();
    const descripcion = req.body.descripcion.trim();
    const archivo = req.body.files;

    if(asunto === '' || idPlataforma === '' || descripcion === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Por favor llene todos los campos.' });
        return;
    }

    const superdistribuidor = await Usuarios.findOne({ where: { enlace_afiliado: req.user.super_patrocinador }});

    if(!req.location || req.file === undefined || req.file === null) {
        var nombreArchivo = null;
    }

    if(req.file.location === 'undefined' || req.file.location === '' || req.file.location === null) {
        var nombreArchivo = null;
    } else {
        var nombreArchivo = req.file.location;
    }

    await Insidencias.create({
        idInsidencia: uuid_v4(),
        idSuperdistribuidor: superdistribuidor.id_usuario,
        estado: 0,
        asunto: asunto,
        descripcion: descripcion,
        plataformaIdPlataforma: idPlataforma,
        usuarioIdUsuario: req.user.id_usuario,
        imagen: nombreArchivo,
    });

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Insidencia reportada con éxito.'});
    return;

}

exports.infoInsidencia = async (req, res) => {

    const idInsidencia = req.body.id.trim();

    const insidencia = await Insidencias.findOne({ where: { idInsidencia: idInsidencia }});

    const usuario = await Usuarios.findOne({ where: { id_usuario: insidencia.usuarioIdUsuario }});

    const plataforma = await Plataformas.findOne({ where: { id_plataforma: insidencia.plataformaIdPlataforma }});

    const valFoto = usuario.foto;

    if(valFoto === null) {
        var foto = '/assetsDashboard/img/users/default.jpg';
    } else {
        var foto = '/uploads/usuarios/'+valFoto;
    }

    res.json({ asunto: insidencia.asunto, descripcion: insidencia.descripcion, imagen: insidencia.imagen, fecha: insidencia.fecha, usuario: usuario.nombre, plataforma: plataforma.plataforma, perfil: usuario.perfil, foto: foto, idInsidencia: idInsidencia, respuesta: insidencia.respuesta});
    return;

}

exports.insidencias = async (req, res) => {

    const insidenciaNoRespondidas = await Insidencias.findAll({
        where: {
            [Op.and]:[{ usuarioIdUsuario: req.user.id_usuario }]
        },
        order: [['fecha', 'DESC']]
    });

    const superdistribuidor = await Usuarios.findOne({ where: { enlace_afiliado: req.user.super_patrocinador }});
    
    const plataformas = await Plataformas.findAll({ 
        where: {
            [Op.and]:[{id_superdistribuidor: superdistribuidor.id_usuario}, {estado:1}]
        }
    });

    res.json({ insidencias: insidenciaNoRespondidas, plataformas: plataformas, nombre: req.user.nombre});
    return;

}

exports.sinResponder = async (req, res) => {

    const insidenciaNoRespondidas = await Insidencias.findAll({
        where: {
            [Op.and]:[{ usuarioIdUsuario: req.user.id_usuario }, {estado:0}]
        },
        order: [['fecha', 'DESC']]
    });

    const superdistribuidor = await Usuarios.findOne({ where: { enlace_afiliado: req.user.super_patrocinador }});
    
    const plataformas = await Plataformas.findAll({ 
        where: {
            [Op.and]:[{id_superdistribuidor: superdistribuidor.id_usuario}, {estado:1}]
        }
    });

    res.json({ insidencias: insidenciaNoRespondidas, plataformas: plataformas, nombre: req.user.nombre});
    return;

}

exports.respondidas = async (req, res) => {

    const insidenciaNoRespondidas = await Insidencias.findAll({
        where: {
            [Op.and]:[{ usuarioIdUsuario: req.user.id_usuario }, {estado:1}]
        },
        order: [['fecha', 'DESC']]
    });

    const superdistribuidor = await Usuarios.findOne({ where: { enlace_afiliado: req.user.super_patrocinador }});
    
    const plataformas = await Plataformas.findAll({ 
        where: {
            [Op.and]:[{id_superdistribuidor: superdistribuidor.id_usuario}, {estado:1}]
        }
    });

    res.json({ insidencias: insidenciaNoRespondidas, plataformas: plataformas, nombre: req.user.nombre});
    return;

}

exports.adminInsidencias = async (req, res) => {

    const insidencias = await Insidencias.findAll({ 
        where: { idSuperdistribuidor: req.user.id_usuario },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
            {model: Plataformas, foreignKey: 'plataformaIdPlataforma'}
        ],
        order: [['fecha', 'DESC']]
    });

    const countInsidenciasRespondidas = await Insidencias.count({ 
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, {estado: 1}]
        }
    });

    const countInsidenciasNoRespondidas = await Insidencias.count({ 
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, {estado: 0}]
        }
    });

    res.render('dashboard/adminInsidencias', {
        nombrePagina : 'Administración de Insidencias',
        titulo: 'Administración de Insidencias',
        breadcrumb: 'Administración de Insidencias',
        classActive: req.path.split('/')[2],
        insidencias,
        countInsidenciasRespondidas,
        countInsidenciasNoRespondidas,
    })

}

exports.insidenciasSuperdistribuidor = async (req, res) => {

    const insidenciaNoRespondidas = await Insidencias.findAll({
        where: {
            [Op.and]:[{ idSuperdistribuidor: req.user.id_usuario }]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
            {model: Plataformas, foreignKey: 'plataformaIdPlataforma'}
        ],
        order: [['fecha', 'DESC']]
    });
    
    const plataformas = await Plataformas.findAll({ 
        where: {
            [Op.and]:[{id_superdistribuidor: req.user.id_usuario}, {estado:1}]
        }
    });

    res.json({ insidencias: insidenciaNoRespondidas, plataformas: plataformas});
    return;

}

exports.sinResponderSuperdistribuidor = async (req, res) => {

    const insidenciaNoRespondidas = await Insidencias.findAll({
        where: {
            [Op.and]:[{ idSuperdistribuidor: req.user.id_usuario }, {estado:0}]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
            {model: Plataformas, foreignKey: 'plataformaIdPlataforma'}
        ],
        order: [['fecha', 'DESC']]
    });
    
    const plataformas = await Plataformas.findAll({ 
        where: {
            [Op.and]:[{id_superdistribuidor: req.user.id_usuario}, {estado:1}]
        }
    });

    res.json({ insidencias: insidenciaNoRespondidas, plataformas: plataformas});
    return;

}

exports.respondidasSuperdistribuidor = async (req, res) => {

    const insidenciaNoRespondidas = await Insidencias.findAll({
        where: {
            [Op.and]:[{ idSuperdistribuidor: req.user.id_usuario }, {estado:1}]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
            {model: Plataformas, foreignKey: 'plataformaIdPlataforma'}
        ],
        order: [['fecha', 'DESC']]
    });
    
    const plataformas = await Plataformas.findAll({ 
        where: {
            [Op.and]:[{id_superdistribuidor: req.user.id_usuario}, {estado:1}]
        }
    });

    res.json({ insidencias: insidenciaNoRespondidas, plataformas: plataformas});
    return;

}

exports.responderInsidencia = async (req, res) => {

    const idInsidencia = req.body.id;
    const respuesta = req.body.respuesta;
    const archivo = req.body.files;

    console.log(req.body);

    if(respuesta === ''){
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No puede enviar una respuesta vacia' });
        return;
    }

    const insidencia = await Insidencias.findOne({
        where: {
            [Op.and]:[{idInsidencia: idInsidencia}]
        }
    })

    if(!insidencia){
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible responder esta insidencia debido a que ya no existe en nuestros servidores.' });
        return;
    }

    insidencia.estado = 1;
    insidencia.respuesta = respuesta;
    await insidencia.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Insidencia respondida con éxito.'});
    return;
    
}
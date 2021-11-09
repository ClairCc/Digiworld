const Usuarios = require('../models/usuariosModelo');
const Asignaciones = require('../models/asignacionesModelo');
const Plataformas = require('../models/plataformasModelo');
const Publicidad = require('../models/publicidadModelo');
const Cuentas = require('../models/cuentasModelo');
const { Op, and } = require("sequelize");
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const bcrypt = require('bcrypt-nodejs');
const {s3, bucket} = require('../config/awsS3');
const multerS3 = require('multer-s3');

// Inicio
exports.inicio = async (req, res) => {
    const usuario = await Usuarios.findOne({ where: { email: req.user.email }});

    res.render('dashboard/inicio', {
        nombrePagina : 'Inicio',
        titulo: 'Inicio',
        breadcrumb: 'Inicio',
        classActive: req.path.split('/')[2],
        usuario
    })
}

// Mi Perfil
exports.perfil =  async (req, res) => {
    const usuario = await Usuarios.findOne({ where: { email: req.user.email }});

    res.render('dashboard/mi-perfil', {
        nombrePagina : 'Mi Perfil',
        titulo: 'Mi Perfil',
        breadcrumb: 'Mi Perfil',
        classActive: req.path.split('/')[2],
        countDist: res.locals.countDist,
        countRes: res.locals.countRes,
        countSuperdist: res.locals.countSuperdist,
        patrocinador: res.locals.patrocinadorNombre,
        telefonoPatrocinador: res.locals.patrocinadorTelefono,
        usuario
    })
}

exports.cambiarPassword = async (req, res, next) => {

    const password = req.body.password;

    if(password === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No puede enviar un campo vacio como nueva contraseña.' });
        return;
    }
    // verificar usuario existe
    const usuario = await Usuarios.findOne({ where: { email: req.user.email }});

    // si no existe redireccionar
    if(!usuario) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible cambiar la contraseña a este usuario.' });
        return;
    }

    const newPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

    // si existe editar perfil y redireccionar
    usuario.password = newPassword;

    await usuario.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'La contraseña ha sido actualizada con éxito.' });
    return;
}

exports.validarEditarPerfil = async (req, res, next) => {

    // Nueva validacion express validator

    const rules = [
        body('nombre').not().isEmpty().withMessage('El nombre no puede estar vacio').trim().escape(),
        body('direccion').not().isEmpty().withMessage('La dirección no puede estar vacio').trim().escape(),
        body('telefono').not().isEmpty().withMessage('El teléfono no puede estar vacio').trim().escape(),
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));

    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg));
        res.render('/dashboard/mi-perfil', {
            nombrePagina : 'Mi Perfil',
            titulo: 'Mi Perfil',
            breadcrumb: 'Mi Perfil',
            classActive: req.path.split('/')[2],
            countDist: res.locals.countDist,
            countRes: res.locals.countRes,
            countSuperdist: res.locals.countSuperdist,
            patrocinador: res.locals.patrocinadorNombre,
            telefonoPatrocinador: res.locals.patrocinadorTelefono,
            mensajes: req.flash()
        })
        return;
    }
 
    //si toda la validacion es correcta
    next();
    
}

exports.editarPerfil = async (req, res, next) => {
    // verificar usuario existe
    const usuario = await Usuarios.findOne({ where: { email: req.params.correo }});

    // si no existe redireccionar
    if(!usuario) {
        req.flash('error', 'Hubo un error al actualizar los datos de tu perfil');
        res.redirect('/dashboard/mi-perfil');
        return next();
    }

    const datos = req.body;

    // si existe editar perfil y redireccionar
    usuario.nombre = datos.nombre;
    usuario.direccion = datos.direccion;
    usuario.telefono_movil = datos.telefono;
    await usuario.save();

    req.flash('success', 'Perfil editado con éxito');
    res.render('dashboard/mi-perfil', {
        nombrePagina : 'Mi Perfil',
        titulo: 'Mi Perfil',
        breadcrumb: 'Mi Perfil',
        classActive: req.path.split('/')[2],
        countDist: res.locals.countDist,
        countRes: res.locals.countRes,
        countSuperdist: res.locals.countSuperdist,
        patrocinador: res.locals.patrocinadorNombre,
        telefonoPatrocinador: res.locals.patrocinadorTelefono,
        usuario,
        mensajes: req.flash()
    })
    return;
}

exports.validarEditarRedesSociales = async (req, res, next) => {

    // Nueva validacion express validator

    const rules = [
        body('facebook').not().contains('facebook').withMessage('La URL de facebook es incorrecta').trim().escape(),
        body('instagram').not().contains('instagram').withMessage('La URL de instagram es incorrecta').trim().escape(),
    ];
 
    await Promise.all(rules.map(validation => validation.run(req)));

    const errores = validationResult(req);
    //si hay errores
    if (!errores.isEmpty()) {
        req.flash('error', 'La URL de facebook o Instagram no es valida');
        res.redirect('/dashboard/mi-perfil');
        return next();
    }
 
    //si toda la validacion es correcta
    next();
    
}

exports.editarRedesSociales = async (req, res, next) => {
    // verificar usuario existe
    const usuario = await Usuarios.findOne({ where: { email: req.params.correo }});

    // si no existe redireccionar
    if(!usuario) {
        req.flash('error', 'Hubo un error al actualizar los datos de tus redes sociales');
        res.redirect('/dashboard/mi-perfil');
        return next();
    }

    const datos = req.body;

    // si existe editar perfil y redireccionar
    usuario.facebook = datos.facebook;
    usuario.instagram = datos.instagram;
    await usuario.save();

    req.flash('success', 'Redes sociales editadas con éxito');
    res.render('dashboard/mi-perfil', {
        nombrePagina : 'Mi Perfil',
        titulo: 'Mi Perfil',
        breadcrumb: 'Mi Perfil',
        classActive: req.path.split('/')[2],
        countDist: res.locals.countDist,
        countRes: res.locals.countRes,
        countSuperdist: res.locals.countSuperdist,
        patrocinador: res.locals.patrocinadorNombre,
        telefonoPatrocinador: res.locals.patrocinadorTelefono,
        usuario,
        mensajes: req.flash()
    })
    return;
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
            next(null, `il_salone/usuarios/${file.originalname}`);
        }
    })
});

const upload = multer(configuracionMulter).single('files');

exports.uploadFoto = async (req, res, next) => {
    upload(req, res, function(error) {
        if(error){
            console.log(error);
            req.flash('error', 'Hay un error en el archivo');
            res.redirect('/dashboard/mi-perfil');
            return next();
        } else {
            next();
        }
    })
}

// subir imagen en el servidor
exports.subirFoto = async (req, res, next) => {
    // verificar usuario existe
    const usuario = await Usuarios.findOne({ where: { email: req.params.correo }});

    // si no existe redireccionar
    if(!usuario) {
        req.flash('error', 'Hubo un error al actualizar la foto de perfil');
        res.redirect('/dashboard/mi-perfil');
        return next();
    }

    if(!req.file) {
        req.flash('error', 'No se selecciono una imagen');
        res.redirect('/dashboard/mi-perfil');
        return next();
    }

    // Leer imagen
    usuario.foto = req.file.location;
    await usuario.save();

    req.flash('success', 'La foto de perfil ha sido actualizada con éxito');
    res.render('dashboard/mi-perfil', {
        nombrePagina : 'Mi Perfil',
        titulo: 'Mi Perfil',
        breadcrumb: 'Mi Perfil',
        classActive: req.path.split('/')[2],
        countDist: res.locals.countDist,
        countRes: res.locals.countRes,
        countSuperdist: res.locals.countSuperdist,
        patrocinador: res.locals.patrocinadorNombre,
        telefonoPatrocinador: res.locals.patrocinadorTelefono,
        usuario,
        mensajes: req.flash()
    })
    return next();
}
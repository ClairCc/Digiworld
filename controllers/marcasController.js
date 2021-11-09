const Marcas = require('../models/marcasModelo');
const { Op } = require("sequelize");
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const fs = require('fs');
const {s3, bucket} = require('../config/awsS3');
const multerS3 = require('multer-s3');

exports.adminMarcasBlancas = async (req, res) => {

    const marcas = await Marcas.findAll();
    const countTotal = await Marcas.count();

    res.render('dashboard/adminMarcasBlancas', {
        nombrePagina : 'Administrador Marcas Blancas',
        titulo: 'Administrador Marcas Blancas',
        breadcrumb: 'Administrador Marcas Blancas',
        classActive: req.path.split('/')[2],
        marcas,
        countTotal
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
            next(null, `il_salone/marcas/${file.originalname}`);
        }
    })
});

const upload1 = multer(configuracionMulter).any('logo', 'icono');

exports.uploadLogo = async (req, res, next) => {

    upload1(req, res, function(error) {
        if(error){
            res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Hubo un error con el archivo que desea subir en logo' });
            return;
        } else {
            next();
        }
    })
}

exports.crearMarca = async (req, res) => {

    if(req.body.logo === 'undefined' || req.body.icono === 'undefined' || req.body.logoBlanco === 'undefined' || req.body.iconoBlanco === 'undefined') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir todas las imagenes.' });
        return;
    }

    const marca = req.body.marca;
    const url = req.body.url;
    const icono = req.files[0].location;
    const logo = req.files[1].location;
    const icono2 = req.files[2].location;
    const logo2 = req.files[3].location;

    if(marca === '' || url === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe llenar todos los campos.' });
        return;
    }

    try {
        
        await Marcas.create({
            id_marca: uuid_v4(),
            nombre_marca: marca,
            url: url,
            estado: 1,
            icono: icono,
            logo: logo,
            iconoBlanco: icono2,
            logoBlanco: logo2
        });
    
        res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Marca blanca creada con éxito.' });
        return;

    } catch (error) {
        console.log(error);
        res.json({ titulo: '¡Lo sentimos!', resp: 'error', descripcion: error.message });
        return; 
    }


}

exports.editarMarca = async (req, res) => {

    const id_marca = req.body.id.trim();
    const nombreMarca = req.body.marca.trim();
    const url = req.body.url.trim();

    const marca = await Marcas.findOne({ where: { id_marca: id_marca }});

    if(!marca) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible editar la marca blanca.' });
        return;
    }

    marca.nombre_marca = nombreMarca;
    marca.url = url;

    await marca.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Marca blanca editada con éxito.' });
    return;

}

exports.eliminarMarca = async (req, res) => {

    const id_marca = req.body.id.trim();

    const marca = await Marcas.findOne({ where: { id_marca: id_marca }});

    if(!marca) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible eliminar la marca blanca.' });
        return;
    }

    // Eliminar imagenes
    fs.unlink(__dirname + '/../public/uploads/marcas/' + marca.icono, () => {
        console.log('Icono Removido')
    })

    fs.unlink(__dirname + '/../public/uploads/marcas/' + marca.logo, () => {
        console.log('Logo removido')
    })

    fs.unlink(__dirname + '/../public/uploads/marcas/' + marca.iconoBlanco, () => {
        console.log('Icono Blanco Removido')
    })

    fs.unlink(__dirname + '/../public/uploads/marcas/' + marca.logoBlanco, () => {
        console.log('Logo Blanco Removido')
    })

    await Marcas.destroy({ where: { id_marca: id_marca }});

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Marca blanca eliminada con éxito.' });
    return;

}

exports.cambioEstado = async (req, res) => {

    const id_marca = req.body.id.trim();

    const marca = await Marcas.findOne({ where: { id_marca: id_marca }});

    if(!marca) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible cambiar el estado de la marca blanca.' });
        return;
    }

    if(marca.estado === 1) {
        var estado = 0;
        var descripcion = 'marca blanca desactivada con éxito.';
    } else {
        var estado = 1;
        var descripcion = 'marca blanca activada con éxito.';
    }

    // si existe confirmar cuenta y redireccionar
    marca.estado = estado;
    await marca.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: descripcion });
    return;

}
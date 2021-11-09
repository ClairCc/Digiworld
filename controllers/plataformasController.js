const Plataformas = require('../models/plataformasModelo');
const Asignaciones = require('../models/asignacionesModelo');
const Usuarios = require('../models/usuariosModelo');
const { Op } = require("sequelize");
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const fs = require('fs');
const { s3, bucket } = require('../config/awsS3');
const multerS3 = require('multer-s3');

// Admin
exports.adminPlataformas = async(req, res) => {

    const plataformas = await Plataformas.findAll();
    const countNormales = await Plataformas.count({
        where: { tipo_plataforma: 1 }
    });
    const countPedidos = await Plataformas.count({
        where: { tipo_plataforma: 2 }
    });
    const countPersonalizadas = await Plataformas.count({
        where: { tipo_plataforma: 3 }
    });
    const countRenovaciones = await Plataformas.count({
        where: { tipo_plataforma: 4 }
    });
    const countJuegos = await Plataformas.count({
        where: { tipo_plataforma: 5 }
    });
    const countTotal = await Plataformas.count();

    res.render('dashboard/adminPlataformas', {
        nombrePagina: 'Administrador Plataformas',
        titulo: 'Administrador Plataformas',
        breadcrumb: 'Administrador Plataformas',
        classActive: req.path.split('/')[2],
        plataformas,
        countNormales,
        countPedidos,
        countPersonalizadas,
        countRenovaciones,
        countJuegos,
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
            next(null, `il_salone/plataformas/${file.originalname}`);
        }
    })
});

const upload = multer(configuracionMulter).single('files');

exports.uploadFoto = async(req, res, next) => {

    upload(req, res, function(error) {
        if (error) {
            res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Hubo un error con el archivo que desea subir.' });
            return;
        } else {
            next();
        }
    })
}

exports.crearPlataforma = async(req, res) => {

    if (!req.file) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir una imagen para el logo de la plataforma.' });
        return;
    }

    if (req.file.location === 'undefined' || req.file.location === '' || req.file.location === null) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir una imagen para el logo de la plataforma.' });
        return;
    }

    const plataforma = req.body.plataforma;
    const tipoPlataforma = req.body.tipoPlataforma;
    const descripcion = req.body.descripcion;

    if (plataforma === '' || tipoPlataforma === '' || descripcion === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe llenar todos los campos.' });
        return;
    }

    try {

        await Plataformas.create({
            id_plataforma: uuid_v4(),
            plataforma: plataforma,
            tipo_plataforma: tipoPlataforma,
            descripcion: descripcion,
            logo: req.file.location
        });

        res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Plataforma creada con éxito.' });
        return;

    } catch (error) {
        // console.log(error);
        res.json({ titulo: '¡Lo sentimos!', resp: 'error', descripcion: error.message });
        return;
    }


}

exports.editarPlataforma = async(req, res) => {

    const id_plataforma = req.body.id.trim();
    const nombrePlataforma = req.body.plataforma.trim();
    const tipoPlataforma = req.body.tipoPlataforma.trim();
    const descripcion = req.body.descripcion.trim();

    const plataforma = await Plataformas.findOne({ where: { id_plataforma: id_plataforma } });

    if (!plataforma) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible editar la plataforma.' });
        return;
    }

    plataforma.plataforma = nombrePlataforma;
    plataforma.tipo_plataforma = tipoPlataforma;
    plataforma.descripcion = descripcion;

    await plataforma.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Plataforma editada con éxito.' });
    return;

}

exports.eliminarPlataforma = async(req, res) => {

    const id_plataforma = req.body.id.trim();

    const plataforma = await Plataformas.findOne({ where: { id_plataforma: id_plataforma } });

    if (!plataforma) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible eliminar la plataforma.' });
        return;
    }

    // Eliminar imagenes
    fs.unlink(__dirname + '/../public/uploads/plataformas/' + plataforma.logo, () => {
        // console.log('Icono Removido')
    })

    await Plataformas.destroy({ where: { id_plataforma: id_plataforma } });

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Plataforma eliminada con éxito.' });
    return;

}

exports.cambioEstado = async(req, res) => {

    const id_plataforma = req.body.id.trim();

    const plataforma = await Plataformas.findOne({ where: { id_plataforma: id_plataforma } });

    if (!plataforma) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible cambiar el estado de la plataforma.' });
        return;
    }

    if (plataforma.estado === 1) {
        var estado = 0;
        var descripcion = 'plataforma desactivada con éxito.';
    } else {
        var estado = 1;
        var descripcion = 'plataforma activada con éxito.';
    }

    // si existe confirmar cuenta y redireccionar
    plataforma.estado = estado;
    await plataforma.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: descripcion });
    return;

}

// ============================================================================
//                      Superdistribuidores controller
// ============================================================================

exports.adminPlataformasSuperdistribuidor = async(req, res) => {

    const plataformas = await Plataformas.findAll({
        where: {
            [Op.and]: [{ estado: 1 }, { id_superdistribuidor: req.user.id_usuario }],
        }
    });

    const countNormales = await Plataformas.count({
        where: {
            [Op.and]: [{ tipo_plataforma: 1 }, { estado: 1 }, { id_superdistribuidor: req.user.id_usuario }],
        }
    });
    const countPedidos = await Plataformas.count({
        where: {
            [Op.and]: [{ tipo_plataforma: 2 }, { estado: 1 }, { id_superdistribuidor: req.user.id_usuario }],
        }
    });
    const countPersonalizadas = await Plataformas.count({
        where: {
            [Op.and]: [{ tipo_plataforma: 3 }, { estado: 1 }, { id_superdistribuidor: req.user.id_usuario }],
        }
    });
    const countRenovaciones = await Plataformas.count({
        where: {
            [Op.and]: [{ tipo_plataforma: 4 }, { estado: 1 }, { id_superdistribuidor: req.user.id_usuario }],
        }
    });
    const countJuegos = await Plataformas.count({
        where: {
            [Op.and]: [{ tipo_plataforma: 5 }, { estado: 1 }, { id_superdistribuidor: req.user.id_usuario }],
        }
    });

    const countTotal = await Plataformas.count({
        where: {
            [Op.and]: [{ estado: 1 }, { id_superdistribuidor: req.user.id_usuario }],
        }
    });

    const asignaciones = await Asignaciones.findAll({
        where: { usuarioIdUsuario: req.user.id_usuario }
    });

    res.render('dashboard/adminPlataformasSuperdistribuidor', {
        nombrePagina: 'Administrador Plataformas',
        titulo: 'Administrador Plataformas',
        breadcrumb: 'Administrador Plataformas',
        classActive: req.path.split('/')[2],
        plataformas,
        countNormales,
        countPedidos,
        countPersonalizadas,
        countRenovaciones,
        countJuegos,
        countTotal,
        asignaciones
    })
}

exports.subirValor = async(req, res) => {

    const id_plataforma = req.body.id.trim();
    const valor = req.body.valor.trim();

    const asignacion = await Asignaciones.findAll({
        where: { plataformaIdPlataforma: id_plataforma }
    });

    if (!asignacion) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible editar el valor de esta plataforma.' });
        return;
    }

    for (var i = 0; i < asignacion.length; i++) {

        const asignaciones = await Asignaciones.findOne({
            where: { id_asignacion: asignacion[i].id_asignacion }
        });

        // console.log('Nuevo valor: ' + (Number(asignaciones.valor) + Number(valor)));
        // console.log(asignaciones.id_asignacion);

        asignaciones.valor = Number(asignaciones.valor) + Number(valor);
        await asignaciones.save();

    }

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Valor de la plataforma ha sido aumentado en toda su red con éxito.' });
    return;

}

exports.bajarValor = async(req, res) => {

    const id_plataforma = req.body.id.trim();
    const valor = req.body.valor.trim();

    const asignacion = await Asignaciones.findAll({
        where: { plataformaIdPlataforma: id_plataforma }
    });

    if (!asignacion) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible editar el valor de esta plataforma.' });
        return;
    }

    for (var i = 0; i < asignacion.length; i++) {

        const asignaciones = await Asignaciones.findOne({
            where: { id_asignacion: asignacion[i].id_asignacion }
        });

        // console.log('Nuevo valor: ' + (Number(asignaciones.valor) - Number(valor)));
        // console.log(asignaciones.id_asignacion);

        asignaciones.valor = Number(asignaciones.valor) - Number(valor);
        await asignaciones.save();

    }

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Valor de la plataforma ha sido disminuido en toda su red con éxito.' });
    return;

}

exports.editarLogo = async(req, res) => {

    if (!req.file) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir una imagen para el logo de la plataforma.' });
        return;
    }

    if (req.file.location === 'undefined' || req.file.location === '' || req.file.location === null) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir una imagen para el logo de la plataforma.' });
        return;
    }

    const idPlataforma = req.body.id.trim();

    const plataforma = await Plataformas.findOne({
        where: {
            [Op.and]: [{ id_plataforma: idPlataforma }]
        }
    })

    if (!plataforma) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No existe la plataforma a la cual dese editar el logo.' });
        return;
    }

    plataforma.logo = req.file.location;
    plataforma.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Logo actualizado con éxito.' });
    return;

}

exports.crearPlataformaSuperdistribuidor = async(req, res) => {

    if (!req.file) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir una imagen para el logo de la plataforma.' });
        return;
    }

    if (req.file.location === 'undefined' || req.file.location === '' || req.file.location === null) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir una imagen para el logo de la plataforma.' });
        return;
    }

    const plataforma = req.body.plataforma;
    const tipoPlataforma = req.body.tipoPlataforma;
    const descripcion = req.body.descripcion;
    const valor = req.body.valor;

    if (plataforma === '' || tipoPlataforma === '' || descripcion === '' || valor === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe llenar todos los campos.' });
        return;
    }

    try {
        const idPlataforma = uuid_v4();

        await Plataformas.create({
            id_plataforma: idPlataforma,
            plataforma: plataforma,
            tipo_plataforma: tipoPlataforma,
            descripcion: descripcion,
            logo: req.file.location,
            id_superdistribuidor: req.user.id_usuario
        });

        const plataformas = await Plataformas.findAll({
            where: { plataforma: plataforma }
        });

        // datos del usuario a asignar
        const usuario = await Usuarios.findOne({
            where: {
                [Op.and]: [{ id_usuario: req.user.id_usuario }, { bloqueo: 0 }],
            },
            attributes: ['patrocinador', 'super_patrocinador'],
        });

        if (!usuario) {
            res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible asignar las plataformas a este usuario ya que se encuentra bloqueado o no existe en la plataforma' });
            return;
        }

        const enlace_distribuidor = usuario.patrocinador;
        const enlace_superdistribuidor = usuario.super_patrocinador;

        // id distribuidor
        const distribuidor = await Usuarios.findOne({
            where: { enlace_afiliado: enlace_distribuidor },
            attributes: ['id_usuario'],
        });
        const idDistribuidor = distribuidor.id_usuario;

        // id superdistribuidor
        const superdistribuidor = await Usuarios.findOne({
            where: { enlace_afiliado: enlace_superdistribuidor },
            attributes: ['id_usuario'],
        });
        const idSuperdistribuidor = superdistribuidor.id_usuario;

        await Asignaciones.create({
            id_asignacion: uuid_v4(),
            valor: valor,
            id_distribuidor: idDistribuidor,
            id_superdistribuidor: idSuperdistribuidor,
            usuarioIdUsuario: req.user.id_usuario,
            plataformaIdPlataforma: idPlataforma
        });

        res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Plataforma creada con éxito.' });
        return;

    } catch (error) {
        // console.log(error);
        res.json({ titulo: '¡Que bien!', resp: 'error', descripcion: error.message });
        return;
    }


}

exports.eliminarPlataformaSuperdistribuidor = async(req, res) => {

    const id_plataforma = req.body.id.trim();

    const plataforma = await Plataformas.findOne({ where: { id_plataforma: id_plataforma } });

    if (!plataforma) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible eliminar la plataforma.' });
        return;
    }

    // Eliminar imagenes
    fs.unlink(__dirname + '/../public/uploads/plataformas/' + plataforma.logo, () => {
        // console.log('Logo Removido')
    })

    await Asignaciones.destroy({
        where: { plataformaIdPlataforma: id_plataforma }
    });
    await Plataformas.destroy({ where: { id_plataforma: id_plataforma } });

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Plataforma eliminada con éxito.' });
    return;

}

exports.desplegarPlataformas = async(req, res) => {
    const id_asignacion = req.body.id;
    const asignacion = await Asignaciones.findOne({
        where: { id_asignacion: id_asignacion }
    });
    const id_plataforma = asignacion.plataformaIdPlataforma;

    const superdistribuidor = await Usuarios.findOne({
        where: { id_usuario: req.user.id_usuario },
        attributes: ['enlace_afiliado']
    });

    const plataforma = await Plataformas.findOne({
        where: { id_plataforma: id_plataforma },
        attributes: ['plataforma']
    });

    const nombrePlataforma = plataforma.plataforma.toLowerCase();

    const usuarios = await Usuarios.findAll({
        where: {
            [Op.and]: [{ super_patrocinador: superdistribuidor.enlace_afiliado }, {
                perfil: {
                    [Op.ne]: 'superdistribuidor'
                }
            }],
        }
    });

    for (var i = 0; i < usuarios.length; i++) {
        // console.log(usuarios[i].nombre);
        const id_usuario = usuarios[i].id_usuario;
        const distribuidorAsignacion = await Usuarios.findOne({
            where: { enlace_afiliado: usuarios[i].patrocinador },
            attributes: ['id_usuario', 'nombre']
        });

        const asignaciones = await Asignaciones.findOne({
            where: {
                [Op.and]: [{ usuarioIdUsuario: distribuidorAsignacion.id_usuario }, { plataformaIdPlataforma: id_plataforma }],
            },
            attributes: ['valor']
        });

        const valorBase = asignaciones.valor;

        const testAsignacionPlataforma = await Asignaciones.findOne({
            where: {
                [Op.and]: [{ usuarioIdUsuario: id_usuario }, { plataformaIdPlataforma: id_plataforma }],
            }
        });
        

        if (nombrePlataforma.includes('free fire') || nombrePlataforma.includes('call of duty') || nombrePlataforma.includes('demo')) {
            var valorUsuario = Number(valorBase);
        } else {
            if (usuarios[i].pais === 'Colombia') {
                if (usuarios[i].perfil === 'distribuidor') {
                    var valorUsuario = Number(valorBase) + 1000;
                } else if (usuarios[i].perfil === 'reseller') {
                    var valorUsuario = Number(valorBase) + 2000;
                }
            } else {
                if (usuarios[i].perfil === 'distribuidor') {
                    var valorUsuario = Number(valorBase) + 0.28;
                } else if (usuarios[i].perfil === 'reseller') {
                    var valorUsuario = Number(valorBase) + 0.56;
                }
            }
        }

        if(!testAsignacionPlataforma){
            await Asignaciones.create({
                id_asignacion: uuid_v4(),
                valor: valorUsuario,
                id_distribuidor: distribuidorAsignacion.id_usuario,
                id_superdistribuidor: req.user.id_usuario,
                usuarioIdUsuario: id_usuario,
                plataformaIdPlataforma: id_plataforma
            });
        }else{
            testAsignacionPlataforma.valor = valorUsuario;
            testAsignacionPlataforma.save();
        }
    }

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'La plataforma ha sido desplegada con éxito en la red.' });
    return;
}
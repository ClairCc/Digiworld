const Usuarios = require('../models/usuariosModelo');
const Consignaciones = require('../models/consignacionesModelo');
const Medios = require('../models/mediosModelo');
const Cargas = require('../models/cargasModelo');
const { Op } = require("sequelize");
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const { s3, bucket } = require('../config/awsS3');
const multerS3 = require('multer-s3');

exports.reportarConsignacion = async (req, res) => {

    const consignaciones = await Consignaciones.findAll({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }]
        },
        order: [['fecha', 'DESC']]
    });

    const superdistribuidor = await Usuarios.findOne({ where: { enlace_afiliado: req.user.super_patrocinador } });

    const medios = await Medios.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: superdistribuidor.id_usuario }, { estado: 1 }]
        }
    });

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario } });

    res.render('dashboard/reportarConsignacion', {
        nombrePagina: 'Reportar consignaciones',
        titulo: 'Reportar consignaciones',
        breadcrumb: 'Reportar consignaciones',
        classActive: req.path.split('/')[2],
        usuario,
        consignaciones,
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
            next(null, `il_salone/vouchers/${file.originalname}`);
        }
    })
});

const upload = multer(configuracionMulter).single('comprobante');

exports.uploadComprobante = async (req, res, next) => {

    upload(req, res, function (error) {
        if (error) {
            res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Hubo un error con el archivo que desea subir.' });
            return;
        } else {
            next();
        }
    })
}

exports.subirConsignacion = async (req, res) => {

    const valorConsignado = req.body.valorConsignado;
    const tipoConsignacion = req.body.tipoConsignacion;
    const referencia = req.body.referencia.toLowerCase();
    const telefonoCuenta = req.body.telefonoCuenta;
    const comprobante = req.body.comprobante;
    const fechaHoraConsignacion = req.body.fechaHoraConsignacion;

    const consignaciones = await Consignaciones.findOne({
        where: {
            [Op.and]: [{ referencia: referencia }, { estado: 1 }]
        }
    });

    if (consignaciones) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'El numero de referencia ingresado ya se encuentra en nuestro sistema, por favor verifique e intente nuevamente.' });
        return;
    }

    const consignacionesEnProceso = await Consignaciones.findOne({
        where: {
            [Op.and]: [{ referencia: referencia }, { estado: 0 }]
        }
    });

    if (consignacionesEnProceso) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Ya existe una consignación en proceso de revisión con este nuemero de referencia, por favor vuelva a intentarlo más tarde.' });
        return;
    }

    if (fechaHoraConsignacion === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Por favor ingrese la fecha y hora en la que realizo la consignación ó transferencia.' });
        return;
    }

    if (!req.file) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir el pantallazo o foto legible del comprobante de consignación ó transferencia.' });
        return;
    }

    if (req.file.location === 'undefined' || req.file.location === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir el pantallazo o foto legible del comprobante de consignación ó transferencia.' });
        return;
    }

    if (telefonoCuenta === '') {
        var telefono = 'no aplica';
    } else {
        var telefono = telefonoCuenta;
    }

    const superdistribuidor = await Usuarios.findOne({ where: { enlace_afiliado: req.user.super_patrocinador } });

    if (valorConsignado === '' || tipoConsignacion === '' || referencia === '' || comprobante === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Por favor llene todos los campos.' });
        return;
    }

    await Consignaciones.create({
        idConsignacion: uuid_v4(),
        idSuperdistribuidor: superdistribuidor.id_usuario,
        valor: valorConsignado,
        estado: 0,
        tipoConsignacion: tipoConsignacion,
        referencia: referencia,
        comprobante: req.file.location,
        usuarioIdUsuario: req.user.id_usuario,
        celularConsignacion: telefono,
        fechaHoraConsignacion: fechaHoraConsignacion
    });

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Consignación reportada con éxito.' });
    return;

}

exports.adminConsignaciones = async (req, res) => {

    const consignaciones = await Consignaciones.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' }
        ],
        order: [['fecha', 'DESC']]
    });

    const countConsignaciones = await Consignaciones.count({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 0 }]
        }
    })

    const usuarios = await Usuarios.findAll({
        where: {
            [Op.and]: [{ super_patrocinador: req.user.enlace_afiliado }]
        }
    })

    res.render('dashboard/adminConsignaciones', {
        nombrePagina: 'Administración consignaciones',
        titulo: 'Administración consignaciones',
        breadcrumb: 'Administración consignaciones',
        classActive: req.path.split('/')[2],
        consignaciones,
        countConsignaciones,
        usuarios
    })

}

exports.aprobarConsignacion = async (req, res) => {

    const idConsignacion = req.body.id;
    const responsable = req.body.responsable.trim();

    const consignacion = await Consignaciones.findOne({
        where: {
            [Op.and]: [{ idConsignacion: idConsignacion }]
        }
    });

    if (responsable === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Lo sentimos, debe ingresar su nombre en la casilla de responable de aprobación.' });
        return;
    }

    if (!consignacion) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Lo sentimos no es posible aprobar esta consignación debido a que no existe en nuestros servidores.' });
        return;
    }

    if (consignacion.estado === 1) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible aprobar esta consignación ya que ha sido aprobada anteriormente.' });
        return;
    }

    if (consignacion.estado === 2) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible aprobar esta consignación ya que ha sido rechazada anteriormente.' });
        return;
    }

    consignacion.estado = 1;
    consignacion.responsableGestion = responsable;
    await consignacion.save();

    const usuario = await Usuarios.findOne({
        where: {
            [Op.and]: [{ id_usuario: consignacion.usuarioIdUsuario }]
        }
    });

    const saldoNuevo = Number(usuario.saldo) + Number(consignacion.valor);

    await Cargas.create({
        idCarga: uuid_v4(),
        idSuperdistribuidor: req.user.id_usuario,
        valor: consignacion.valor,
        accionCarga: 'carga',
        tipoCarga: 'consignación',
        saldoAnterior: usuario.saldo,
        saldoNuevo: saldoNuevo,
        usuarioIdUsuario: consignacion.usuarioIdUsuario,
        responsableGestion: responsable
    });

    usuario.saldo = saldoNuevo;
    await usuario.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Consignación aprobada con éxito.' });
    return;

}

exports.rechazarConsignacion = async (req, res) => {

    const idConsignacion = req.body.id;
    const motivo = req.body.motivo.trim();
    const responsable = req.body.responsable.trim();

    const consignacion = await Consignaciones.findOne({
        where: {
            [Op.and]: [{ idConsignacion: idConsignacion }]
        }
    });

    if (responsable === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Lo sentimos, debe ingresar su nombre en la casilla de responable de rechazo.' });
        return;
    }

    if (!consignacion) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Lo sentimos no es posible rechazar esta consignación debido a que no existe en nuestros servidores.' });
        return;
    }

    if (consignacion.estado === 1) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible rechazar esta consignación ya que ha sido aprobada anteriormente.' });
        return;
    }

    consignacion.estado = 2;
    consignacion.observaciones = motivo;
    consignacion.responsableGestion = responsable;
    await consignacion.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Consignación rechazada con éxito.' });
    return;

}
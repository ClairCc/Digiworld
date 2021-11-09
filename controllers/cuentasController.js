const Usuarios = require('../models/usuariosModelo');
const Plataformas = require('../models/plataformasModelo');
const Cuentas = require('../models/cuentasModelo');
const Asignaciones = require('../models/asignacionesModelo');
const Ganancias = require('../models/gananciasModelo');
const { Op } = require("sequelize");
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const fs = require('fs');
const xlsx = require('node-xlsx');
const path = require('path');
const dotenv = require('dotenv');
const { s3, bucket } = require('../config/awsS3');
const multerS3 = require('multer-s3');

// Inicio
exports.subirCuentas = async (req, res) => {
    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario } });
    const superdistribuidor = await Usuarios.findOne({ where: { enlace_afiliado: req.user.super_patrocinador } });
    const usuarios = await Usuarios.findAll({
        where: { patrocinador: req.user.enlace_afiliado }
    });

    const plataformas = await Plataformas.findAll({
        where: {
            [Op.and]: [{ id_superdistribuidor: superdistribuidor.id_usuario }, { estado: 1 }, { tipo_plataforma: 1 }]
        },
        order: [['plataforma', 'DESC']]
    });

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: superdistribuidor.id_usuario }, { tipoCuenta: 1 }]
        },
        order: [['fechaSubida', 'DESC']]
    });

    const cuentasTomadas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: superdistribuidor.id_usuario }, { tipoCuenta: 1 }, { estado: 1 }]
        },
        order: [['fechaSubida', 'DESC']]
    });

    const cuentasSinTomar = await Cuentas.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: superdistribuidor.id_usuario }, { tipoCuenta: 1 }, { estado: 0 }]
        },
        order: [['fechaSubida', 'DESC']]
    });

    res.render('dashboard/subirCuentas', {
        nombrePagina: 'Subir cuentas',
        titulo: 'Subir cuentas',
        breadcrumb: 'Subir cuentas',
        classActive: req.path.split('/')[2],
        usuario,
        usuarios,
        plataformas,
        cuentas,
        cuentasTomadas,
        cuentasSinTomar
    })
}

const configuracionMulter = {
    storage: fileStorage = multer.diskStorage({
        destination: (req, res, next) => {
            next(null, __dirname + '/../public/uploads/assets/');
        },
        filename: (req, file, next) => {
            const extencion = file.mimetype.split('/')[1];
            next(null, `il_salone/${shortid.generate()}.xlsx`);
        }
    })
};

const upload = multer(configuracionMulter).single('files');

exports.uploadExcel = async (req, res, next) => {

    upload(req, res, function (error) {
        if (error) {
            return res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: error.message });
        } else {
            return next();
        }
    })
}

exports.subirCuentasExcel = async (req, res) => {
    const nombreArchivo = req.file.filename;
    const obj = xlsx.parse(fs.readFileSync(__dirname + '/../public/uploads/assets/' + nombreArchivo));

    obj.forEach(async (i) => {
        const fila = i.data;

        for (var i = 0; i < fila.length; i++) {
            const usuario = fila[i][0];
            const contrasena = fila[i][1];
            const pantalla = fila[i][2];
            const pin = fila[i][3];

            if (usuario === undefined || contrasena === undefined || pantalla === undefined || pin === undefined) {
                // Se deja pasar el erorr momentaneamente
                res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible subir el archivo con las cuentas, debido a que hay una columna vacia. Recuerde que las columnas deben ser enviadas en formato "General" de la siguiente Manera: (A) Usuario, (B) Contraseña, (C) Pantalla, (D) Pin; En caso de no requerirse la columna C y D por favor llenar en el Excel con "no aplica."' });
                return;
                break;
            }

            const id_plataforma = req.body.plataforma;
            const idSuperdistribuidor = req.user.id_usuario;
            const tipoCuenta = 1;


            try {

                await Cuentas.create({
                    idCuenta: uuid_v4(),
                    idSuperdistribuidor: idSuperdistribuidor,
                    user: usuario,
                    password: contrasena,
                    pantalla: pantalla,
                    pin: pin,
                    plataformaIdPlataforma: id_plataforma,
                    tipoCuenta: tipoCuenta
                });

            } catch (error) {
                console.log(error);
                res.json({ titulo: '¡Lo sentimos!', resp: 'error', descripcion: error.message });
                return;
                break;
            }

        }

    })

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'El archivo con las cuentas se ha subido en su totalidad con éxito.' });
    return;
}

exports.editarCuenta = async (req, res) => {

    const idCuenta = req.body.id.trim();
    const userCuenta = req.body.usuario.trim();
    const passwordCuenta = req.body.password.trim();
    const pantallaCuenta = req.body.pantalla.trim();
    const pinCuenta = req.body.pin.trim();

    const cuenta = await Cuentas.findOne({ where: { idCuenta: idCuenta } });

    if (userCuenta === '' || passwordCuenta === '' || pantallaCuenta === '' || pinCuenta === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No debe haber campos vacios.' });
        return;
    }

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible editar la cuenta.' });
        return;
    }

    cuenta.user = userCuenta;
    cuenta.password = passwordCuenta;
    cuenta.pantalla = pantallaCuenta;
    cuenta.pin = pinCuenta;

    await cuenta.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Cuenta editada con éxito.' });
    return;

}

exports.eliminarCuenta = async (req, res) => {

    const id = req.body.id.trim();

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible eliminar la cuenta.' });
        return;
    }

    await cuenta.destroy({ where: { idCuenta: id } });

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Cuenta eliminada con éxito.' });
    return;

}

exports.cuentasSinTomar = async (req, res) => {

    const usuario = await Usuarios.findOne({ where: { id_usuario: req.user.id_usuario } });

    const plataformas = await Plataformas.findAll({
        where: {
            [Op.and]: [{ id_superdistribuidor: req.user.id_usuario }, { estado: 1 }]
        },
        order: [['tipo_plataforma', 'ASC']]
    });

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }]
        },
        order: [['fechaSubida', 'DESC']]
    });

    const cuentasSinTomar = await Cuentas.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 0 }]
        },
        order: [['fechaSubida', 'DESC']]
    });

    res.render('dashboard/cuentasSinTomar', {
        nombrePagina: 'Cuentas Sin Tomar',
        titulo: 'Cuentas Sin Tomar',
        breadcrumb: 'Cuentas Sin Tomar',
        classActive: req.path.split('/')[2],
        usuario,
        plataformas,
        cuentas,
        cuentasSinTomar
    })

}

exports.adminCuentasVendidas = async (req, res) => {

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 1 }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ],
        order: [['fechaSubida', 'DESC']]
    })

    const cuentasNormales = await Cuentas.count({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 1 }, { tipoCuenta: 1 }]
        }
    })

    const cuentasBajoPedido = await Cuentas.count({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 1 }, { tipoCuenta: 2 }]
        }
    })

    const cuentasPersonalizadas = await Cuentas.count({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 1 }, { tipoCuenta: 3 }]
        }
    })

    const cuentasRenovaciones = await Cuentas.count({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 1 }, { tipoCuenta: 4 }]
        }
    })

    const cuentasJuegos = await Cuentas.count({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 1 }, { tipoCuenta: 5 }]
        }
    })

    const usuarios = await Usuarios.findAll({
        where: { super_patrocinador: req.user.enlace_afiliado }
    })


    res.render('dashboard/adminCuentasVendidas', {
        nombrePagina: 'Cuentas Vendidas',
        titulo: 'Cuentas Vendidas',
        breadcrumb: 'Cuentas Vendidas',
        classActive: req.path.split('/')[2],
        cuentasNormales,
        cuentasBajoPedido,
        cuentasPersonalizadas,
        cuentasRenovaciones,
        cuentasJuegos,
        cuentas,
        usuarios
    })

}

exports.adminCuentasBajoPedido = async (req, res) => {

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { tipoCuenta: 2 }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ],
        order: [['fechaSubida', 'DESC']]
    })

    const cuentasBajoPedido = await Cuentas.count({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 0 }, { tipoCuenta: 2 }]
        }
    })

    const usuarios = await Usuarios.findAll({
        where: { super_patrocinador: req.user.enlace_afiliado }
    })

    res.render('dashboard/adminCuentasBajoPedido', {
        nombrePagina: 'Cuentas Bajo Pedido',
        titulo: 'Cuentas Bajo Pedido',
        breadcrumb: 'Cuentas Bajo Pedido',
        classActive: req.path.split('/')[2],
        cuentasBajoPedido,
        cuentas,
        usuarios
    })

}

exports.infoCuenta = async (req, res) => {

    const id = req.body.id;

    const cuentas = await Cuentas.findOne({
        where: {
            [Op.and]: [{ idCuenta: id }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ]
    })

    res.json({ cuentas: cuentas });
    return;

}

exports.subirDatosBajoPedido = async (req, res) => {

    const id = req.body.id;
    const user = req.body.usuario;
    const password = req.body.password;
    var pantalla = req.body.pantalla;
    var pin = req.body.pin;

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (user === '' || password === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'El usuario y el password son obligatorios.' });
        return;
    }

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible subir datos a esta cuenta.' });
        return;
    }

    if (pantalla === '' || pin === '') {
        var pantalla = 'no aplica';
        var pin = 'no aplica';
    }

    const asignacionUsuario = await Asignaciones.findOne({
        where: {
            [Op.and]: [{ plataformaIdPlataforma: cuenta.plataformaIdPlataforma }, { usuarioIdUsuario: cuenta.usuarioIdUsuario }]
        }
    });

    const usuario = await Usuarios.findOne({
        where: {
            [Op.and]: [{ id_usuario: cuenta.usuarioIdUsuario }]
        }
    });

    if (Number(asignacionUsuario.valor > Number(usuario.saldo))) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible generar una cuenta de esta plataforma en este momento, debido a que su saldo no es suficiente.' });
        return;
    }

    //Generar Ganancia Disitribuidor
    const distribuidor = await Usuarios.findOne({
        where: {
            [Op.and]: [{ enlace_afiliado: usuario.patrocinador }]
        }
    });

    const asignacionDistribuidor = await Asignaciones.findOne({
        where: {
            [Op.and]: [{ plataformaIdPlataforma: cuenta.plataformaIdPlataforma }, { usuarioIdUsuario: distribuidor.id_usuario }]
        }
    });

    const valorDistribuidor = Number(asignacionDistribuidor.valor);
    const valorUsuario = Number(asignacionUsuario.valor);
    const gananciaDistribuidor = valorUsuario - valorDistribuidor;

    if (cuenta.estado === 1 || cuenta.estado === '1') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'La cuenta ya habia sido gestionanda anteiormente por la tanto no es posible realizar la gestión' });
        return;
    }

    // Usuarios Saldo
    usuario.saldo = Number(usuario.saldo) - Number(asignacionUsuario.valor);
    await usuario.save();

    // Ganancias Distribuidor Saldo
    distribuidor.saldo = Number(distribuidor.saldo) + Number(gananciaDistribuidor);
    await distribuidor.save();

    // Crear ganancia en tabla
    Ganancias.create({
        idGanancia: uuid_v4(),
        ganancia: gananciaDistribuidor,
        distribuidor: distribuidor.id_usuario,
        usuarioIdUsuario: usuario.id_usuario,
        plataformaIdPlataforma: cuenta.plataformaIdPlataforma
    });

    // Editar Cuenta
    cuenta.user = user;
    cuenta.password = password;
    cuenta.pantalla = pantalla;
    cuenta.pin = pin;
    cuenta.estado = 1;
    cuenta.valorPagado = valorUsuario;
    cuenta.fechaCompra = new Date();

    await cuenta.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Los datos han sido subidos a la cuenta con éxito.' });
    return;

}

exports.editarDatosBajoPedido = async (req, res) => {

    const id = req.body.id;
    const usuario = req.body.usuario;
    const password = req.body.password;
    var pantalla = req.body.pantalla;
    var pin = req.body.pin;

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (usuario === '' || password === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'El usuario y el password son obligatorios.' });
        return;
    }

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible subir datos a esta cuenta.' });
        return;
    }

    if (pantalla === '' || pin === '') {
        var pantalla = 'no aplica';
        var pin = 'no aplica';
    }

    cuenta.user = usuario;
    cuenta.password = password;
    cuenta.pantalla = pantalla;
    cuenta.pin = pin;

    await cuenta.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Los datos han sido subidos a la cuenta con éxito.' });
    return;

}

exports.eliminarCuentaBajoPedido = async (req, res) => {

    const id = req.body.id.trim();

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible eliminar la cuenta.' });
        return;
    }

    await cuenta.destroy({ where: { idCuenta: id } });

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Cuenta eliminada con éxito.' });
    return;

}

exports.adminCuentasRenovaciones = async (req, res) => {

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { tipoCuenta: 4 }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ],
        order: [['fechaSubida', 'DESC']]
    })

    const cuentasRenovaciones = await Cuentas.count({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 0 }, { tipoCuenta: 4 }]
        }
    })

    const usuarios = await Usuarios.findAll({
        where: { super_patrocinador: req.user.enlace_afiliado }
    })

    res.render('dashboard/adminCuentasRenovaciones', {
        nombrePagina: 'Cuentas Renovaciones',
        titulo: 'Cuentas Renovaciones',
        breadcrumb: 'Cuentas Renovaciones',
        classActive: req.path.split('/')[2],
        cuentasRenovaciones,
        cuentas,
        usuarios
    })

}

exports.subirDatosRenovacion = async (req, res) => {

    const id = req.body.id;
    const user = req.body.usuario;
    const password = req.body.password;
    var pantalla = req.body.pantalla;
    var pin = req.body.pin;

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (user === '' || password === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'El usuario y el password son obligatorios.' });
        return;
    }

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible subir datos a esta cuenta.' });
        return;
    }

    if (pantalla === '' || pin === '') {
        var pantalla = 'no aplica';
        var pin = 'no aplica';
    }

    const asignacionUsuario = await Asignaciones.findOne({
        where: {
            [Op.and]: [{ plataformaIdPlataforma: cuenta.plataformaIdPlataforma }, { usuarioIdUsuario: cuenta.usuarioIdUsuario }]
        }
    });

    const usuario = await Usuarios.findOne({
        where: {
            [Op.and]: [{ id_usuario: cuenta.usuarioIdUsuario }]
        }
    });

    if (Number(asignacionUsuario.valor > Number(usuario.saldo))) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible generar una cuenta de esta plataforma en este momento, debido a que su saldo no es suficiente.' });
        return;
    }

    //Generar Ganancia Disitribuidor
    const distribuidor = await Usuarios.findOne({
        where: {
            [Op.and]: [{ enlace_afiliado: usuario.patrocinador }]
        }
    });

    const asignacionDistribuidor = await Asignaciones.findOne({
        where: {
            [Op.and]: [{ plataformaIdPlataforma: cuenta.plataformaIdPlataforma }, { usuarioIdUsuario: distribuidor.id_usuario }]
        }
    });

    const valorDistribuidor = Number(asignacionDistribuidor.valor);
    const valorUsuario = Number(asignacionUsuario.valor);
    const gananciaDistribuidor = valorUsuario - valorDistribuidor;

    if (cuenta.estado === 1 || cuenta.estado === '1') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'La cuenta ya habia sido gestionanda anteiormente por la tanto no es posible realizar la gestión' });
        return;
    }

    // Usuarios Saldo
    usuario.saldo = Number(usuario.saldo) - Number(asignacionUsuario.valor);
    await usuario.save();

    // Ganancias Distribuidor Saldo
    distribuidor.saldo = Number(distribuidor.saldo) + Number(gananciaDistribuidor);
    await distribuidor.save();

    // Crear ganancia en tabla
    Ganancias.create({
        idGanancia: uuid_v4(),
        ganancia: gananciaDistribuidor,
        distribuidor: distribuidor.id_usuario,
        usuarioIdUsuario: usuario.id_usuario,
        plataformaIdPlataforma: cuenta.plataformaIdPlataforma
    });

    // Editar Cuenta
    cuenta.user = user;
    cuenta.password = password;
    cuenta.pantalla = pantalla;
    cuenta.pin = pin;
    cuenta.estado = 1;
    cuenta.valorPagado = valorUsuario;
    cuenta.fechaCompra = new Date();

    await cuenta.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'La renovación ha sido realizada con éxito.' });
    return;

}

exports.editarDatosRenovacion = async (req, res) => {

    const id = req.body.id;
    const usuario = req.body.usuario;
    const password = req.body.password;
    var pantalla = req.body.pantalla;
    var pin = req.body.pin;

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (usuario === '' || password === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'El usuario y el password son obligatorios.' });
        return;
    }

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible subir datos a esta cuenta.' });
        return;
    }

    if (pantalla === '' || pin === '') {
        var pantalla = 'no aplica';
        var pin = 'no aplica';
    }

    cuenta.user = usuario;
    cuenta.password = password;
    cuenta.pantalla = pantalla;
    cuenta.pin = pin;

    await cuenta.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Los datos han sido subidos a la renovación con éxito.' });
    return;

}

exports.eliminarCuentaRenovacion = async (req, res) => {

    const id = req.body.id.trim();

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible eliminar la cuenta.' });
        return;
    }

    await cuenta.destroy({ where: { idCuenta: id } });

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Renovación eliminada con éxito.' });
    return;

}

// Personalizadas

exports.adminCuentasPersonalizadas = async (req, res) => {

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { tipoCuenta: 3 }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ],
        order: [['fechaSubida', 'DESC']]
    })

    const cuentasPersonalizadas = await Cuentas.count({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 0 }, { tipoCuenta: 3 }]
        }
    })

    const usuarios = await Usuarios.findAll({
        where: { super_patrocinador: req.user.enlace_afiliado }
    })

    res.render('dashboard/adminCuentasPersonalizadas', {
        nombrePagina: 'Cuentas Personalizadas',
        titulo: 'Cuentas Personalizadas',
        breadcrumb: 'Cuentas Personalizadas',
        classActive: req.path.split('/')[2],
        cuentasPersonalizadas,
        cuentas,
        usuarios
    })

}

exports.subirDatosPersonalizada = async (req, res) => {

    const id = req.body.id;
    const user = req.body.usuario;
    const password = req.body.password;
    var pantalla = req.body.pantalla;
    var pin = req.body.pin;

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (user === '' || password === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'El usuario y el password son obligatorios.' });
        return;
    }

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible subir datos a esta cuenta.' });
        return;
    }

    if (pantalla === '' || pin === '') {
        var pantalla = 'no aplica';
        var pin = 'no aplica';
    }

    const asignacionUsuario = await Asignaciones.findOne({
        where: {
            [Op.and]: [{ plataformaIdPlataforma: cuenta.plataformaIdPlataforma }, { usuarioIdUsuario: cuenta.usuarioIdUsuario }]
        }
    });

    const usuario = await Usuarios.findOne({
        where: {
            [Op.and]: [{ id_usuario: cuenta.usuarioIdUsuario }]
        }
    });

    if (Number(asignacionUsuario.valor > Number(usuario.saldo))) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible generar una cuenta de esta plataforma en este momento, debido a que su saldo no es suficiente.' });
        return;
    }

    //Generar Ganancia Disitribuidor
    const distribuidor = await Usuarios.findOne({
        where: {
            [Op.and]: [{ enlace_afiliado: usuario.patrocinador }]
        }
    });

    const asignacionDistribuidor = await Asignaciones.findOne({
        where: {
            [Op.and]: [{ plataformaIdPlataforma: cuenta.plataformaIdPlataforma }, { usuarioIdUsuario: distribuidor.id_usuario }]
        }
    });

    const valorDistribuidor = Number(asignacionDistribuidor.valor);
    const valorUsuario = Number(asignacionUsuario.valor);
    const gananciaDistribuidor = valorUsuario - valorDistribuidor;

    if (cuenta.estado === 1 || cuenta.estado === '1') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'La cuenta ya habia sido gestionanda anteiormente por la tanto no es posible realizar la gestión' });
        return;
    }

    // Usuarios Saldo
    usuario.saldo = Number(usuario.saldo) - Number(asignacionUsuario.valor);
    await usuario.save();

    // Ganancias Distribuidor Saldo
    distribuidor.saldo = Number(distribuidor.saldo) + Number(gananciaDistribuidor);
    await distribuidor.save();

    // Crear ganancia en tabla
    Ganancias.create({
        idGanancia: uuid_v4(),
        ganancia: gananciaDistribuidor,
        distribuidor: distribuidor.id_usuario,
        usuarioIdUsuario: usuario.id_usuario,
        plataformaIdPlataforma: cuenta.plataformaIdPlataforma
    });

    // Editar Cuenta
    cuenta.user = user;
    cuenta.password = password;
    cuenta.pantalla = pantalla;
    cuenta.pin = pin;
    cuenta.estado = 1;
    cuenta.valorPagado = valorUsuario;
    cuenta.fechaCompra = new Date();

    await cuenta.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'La cuenta ha sido personalizada con éxito.' });
    return;

}

exports.editarDatosPersonalizada = async (req, res) => {

    const id = req.body.id;
    const usuario = req.body.usuario;
    const password = req.body.password;
    var pantalla = req.body.pantalla;
    var pin = req.body.pin;

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (usuario === '' || password === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'El usuario y el password son obligatorios.' });
        return;
    }

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible subir datos a esta cuenta.' });
        return;
    }

    if (pantalla === '' || pin === '') {
        var pantalla = 'no aplica';
        var pin = 'no aplica';
    }

    cuenta.user = usuario;
    cuenta.password = password;
    cuenta.pantalla = pantalla;
    cuenta.pin = pin;

    await cuenta.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Los datos han sido subidos a la personalización con éxito.' });
    return;

}

exports.eliminarCuentaPersonalizada = async (req, res) => {

    const id = req.body.id.trim();

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible eliminar la cuenta.' });
        return;
    }

    await cuenta.destroy({ where: { idCuenta: id } });

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Cuenta personalizada eliminada con éxito.' });
    return;

}

// Juegos

exports.adminCuentasJuegos = async (req, res) => {

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { tipoCuenta: 5 }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ],
        order: [['fechaSubida', 'DESC']]
    })

    const cuentasJuegos = await Cuentas.count({
        where: {
            [Op.and]: [{ idSuperdistribuidor: req.user.id_usuario }, { estado: 0 }, { tipoCuenta: 5 }]
        }
    })

    const usuarios = await Usuarios.findAll({
        where: { super_patrocinador: req.user.enlace_afiliado }
    })

    res.render('dashboard/adminCuentasJuegos', {
        nombrePagina: 'Cuentas Juegos',
        titulo: 'Cuentas Juegos',
        breadcrumb: 'Cuentas Juegos',
        classActive: req.path.split('/')[2],
        cuentasJuegos,
        cuentas,
        usuarios
    })

}

const configuracionMulter2 = ({
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
            next(null, `il_salone/comrpobantesJuegos/${file.originalname}`);
        }
    })
});

const upload2 = multer(configuracionMulter2).single('comprobante');

exports.uploadComprobante = async (req, res, next) => {

    upload2(req, res, function (error) {
        if (error) {
            res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Hubo un error con el archivo que desea subir.' });
            return;
        } else {
            next();
        }
    })
}

exports.subirDatosJuego = async (req, res) => {

    const id = req.body.id;
    var user = req.body.usuario;
    var password = req.body.password;
    var idJuego = req.body.idJuego;
    const comprobante = req.body.comprobante;

    if (!req.file) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir el pantallazo o foto legible del comprobante de carga de esta cuenta.' });
        return;
    }

    if (req.file.location === 'undefined' || req.file.location === '') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'Debe subir el pantallazo o foto legible del comprobante de carga de esta cuenta.' });
        return;
    }

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (idJuego === '') {
        if (user === '' || password === '') {
            res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'El usuario y el password son obligatorios.' });
            return;
        }
        var idJuego = null;
    } else {
        var user = null;
        var password = null;
    }

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible subir datos a esta cuenta.' });
        return;
    }

    const asignacionUsuario = await Asignaciones.findOne({
        where: {
            [Op.and]: [{ plataformaIdPlataforma: cuenta.plataformaIdPlataforma }, { usuarioIdUsuario: cuenta.usuarioIdUsuario }]
        }
    });

    const usuario = await Usuarios.findOne({
        where: {
            [Op.and]: [{ id_usuario: cuenta.usuarioIdUsuario }]
        }
    });

    if (Number(asignacionUsuario.valor > Number(usuario.saldo))) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible generar una cuenta de esta plataforma en este momento, debido a que su saldo no es suficiente.' });
        return;
    }

    //Generar Ganancia Disitribuidor
    const distribuidor = await Usuarios.findOne({
        where: {
            [Op.and]: [{ enlace_afiliado: usuario.patrocinador }]
        }
    });

    const asignacionDistribuidor = await Asignaciones.findOne({
        where: {
            [Op.and]: [{ plataformaIdPlataforma: cuenta.plataformaIdPlataforma }, { usuarioIdUsuario: distribuidor.id_usuario }]
        }
    });

    const valorDistribuidor = Number(asignacionDistribuidor.valor);
    const valorUsuario = Number(asignacionUsuario.valor);
    const gananciaDistribuidor = valorUsuario - valorDistribuidor;

    if (cuenta.estado === 1 || cuenta.estado === '1') {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'La cuenta ya habia sido gestionanda anteiormente por la tanto no es posible realizar la gestión' });
        return;
    }

    // Usuarios Saldo
    usuario.saldo = Number(usuario.saldo) - Number(asignacionUsuario.valor);
    await usuario.save();

    // Ganancias Distribuidor Saldo
    distribuidor.saldo = Number(distribuidor.saldo) + Number(gananciaDistribuidor);
    await distribuidor.save();

    // Crear ganancia en tabla
    Ganancias.create({
        idGanancia: uuid_v4(),
        ganancia: gananciaDistribuidor,
        distribuidor: distribuidor.id_usuario,
        usuarioIdUsuario: usuario.id_usuario,
        plataformaIdPlataforma: cuenta.plataformaIdPlataforma
    });

    // Editar Cuenta
    cuenta.user = user;
    cuenta.password = password;
    cuenta.pantalla = 'no aplica';
    cuenta.pin = 'no aplica';
    cuenta.idJuego = idJuego;
    cuenta.estado = 1;
    cuenta.valorPagado = valorUsuario;
    cuenta.fechaCompra = new Date();
    cuenta.comprobanteJuego = req.file.location;

    await cuenta.save();

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'La cuenta del Juego ha sido gestionada con éxito.' });
    return;

}

exports.eliminarCuentaJuego = async (req, res) => {

    const id = req.body.id.trim();

    const cuenta = await Cuentas.findOne({ where: { idCuenta: id } });

    if (!cuenta) {
        res.json({ titulo: '¡Lo Sentimos!', resp: 'error', descripcion: 'No es posible eliminar la cuenta.' });
        return;
    }

    await cuenta.destroy({ where: { idCuenta: id } });

    res.json({ titulo: '¡Que bien!', resp: 'success', descripcion: 'Cuenta de Juego ha sido eliminada con éxito.' });
    return;

}

// ============================================
//             Usuarios Controlador
// ============================================

exports.cuentasVendidas = async (req, res) => {

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { estado: 1 }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ],
        order: [['fechaSubida', 'DESC']]
    })

    const cuentasNormales = await Cuentas.count({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { estado: 1 }, { tipoCuenta: 1 }]
        }
    })

    const cuentasBajoPedido = await Cuentas.count({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { estado: 1 }, { tipoCuenta: 2 }]
        }
    })

    const cuentasPersonalizadas = await Cuentas.count({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { estado: 1 }, { tipoCuenta: 3 }]
        }
    })

    const cuentasRenovaciones = await Cuentas.count({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { estado: 1 }, { tipoCuenta: 4 }]
        }
    })

    const cuentasJuegos = await Cuentas.count({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { estado: 1 }, { tipoCuenta: 5 }]
        }
    })

    res.render('dashboard/cuentasVendidas', {
        nombrePagina: 'Cuentas Vendidas',
        titulo: 'Cuentas Vendidas',
        breadcrumb: 'Cuentas Vendidas',
        classActive: req.path.split('/')[2],
        cuentasNormales,
        cuentasBajoPedido,
        cuentasPersonalizadas,
        cuentasRenovaciones,
        cuentasJuegos,
        cuentas,
    })

}

exports.cuentasBajoPedido = async (req, res) => {

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { tipoCuenta: 2 }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ],
        order: [['fechaSubida', 'DESC']]
    })

    const cuentasBajoPedido = await Cuentas.count({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { estado: 0 }, { tipoCuenta: 2 }]
        }
    })

    res.render('dashboard/cuentasBajoPedido', {
        nombrePagina: 'Cuentas Bajo Pedido',
        titulo: 'Cuentas Bajo Pedido',
        breadcrumb: 'Cuentas Bajo Pedido',
        classActive: req.path.split('/')[2],
        cuentasBajoPedido,
        cuentas
    })

}

exports.cuentasRenovaciones = async (req, res) => {

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { tipoCuenta: 4 }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ],
        order: [['fechaSubida', 'DESC']]
    })

    const cuentasRenovaciones = await Cuentas.count({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { estado: 0 }, { tipoCuenta: 4 }]
        }
    })

    res.render('dashboard/cuentasRenovaciones', {
        nombrePagina: 'Cuentas Renovaciones',
        titulo: 'Cuentas Renovaciones',
        breadcrumb: 'Cuentas Renovaciones',
        classActive: req.path.split('/')[2],
        cuentasRenovaciones,
        cuentas
    })

}

exports.cuentasPersonalizadas = async (req, res) => {

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { tipoCuenta: 3 }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ],
        order: [['fechaSubida', 'DESC']]
    })

    const cuentasPersonalizadas = await Cuentas.count({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { estado: 0 }, { tipoCuenta: 3 }]
        }
    })

    res.render('dashboard/cuentasPersonalizadas', {
        nombrePagina: 'Cuentas Personalizadas',
        titulo: 'Cuentas Personalizadas',
        breadcrumb: 'Cuentas Personalizadas',
        classActive: req.path.split('/')[2],
        cuentasPersonalizadas,
        cuentas
    })

}

exports.cuentasJuegos = async (req, res) => {

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { tipoCuenta: 5 }]
        },
        include: [
            { model: Usuarios, foreignKey: 'usuarioIdUsuario' },
            { model: Plataformas, foreignKey: 'plataformaIdPlataforma' }
        ],
        order: [['fechaSubida', 'DESC']]
    })

    const cuentasJuegos = await Cuentas.count({
        where: {
            [Op.and]: [{ usuarioIdUsuario: req.user.id_usuario }, { estado: 0 }, { tipoCuenta: 5 }]
        }
    })

    res.render('dashboard/cuentasJuegos', {
        nombrePagina: 'Cuentas Juegos',
        titulo: 'Cuentas Juegos',
        breadcrumb: 'Cuentas Juegos',
        classActive: req.path.split('/')[2],
        cuentasJuegos,
        cuentas
    })

}
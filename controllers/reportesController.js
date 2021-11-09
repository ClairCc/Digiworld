const Usuarios = require('../models/usuariosModelo');
const Plataformas = require('../models/plataformasModelo');
const Cargas = require('../models/cargasModelo');
const Cuentas = require('../models/cuentasModelo');
const Asignaciones = require('../models/asignacionesModelo');
const Ganancias = require('../models/gananciasModelo');
const Consignaciones = require('../models/consignacionesModelo');
const { Op } = require("sequelize");
const {body, validationResult} = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const { v4: uuid_v4 } = require('uuid');
const fs = require('fs');
const xlsx = require('node-xlsx');
const path = require('path');
const dotenv = require('dotenv');
const xl = require('excel4node');
const moment = require('moment');

exports.adminReporteCargas = async (req, res) => {

    const cargas = await Cargas.findAll({
        where: {
            [Op.and]:[{idSuperdistribuidor: req.user.id_usuario}]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
        ],
        order: [['fechaCarga', 'DESC']]
    })

    const usuarios = await Usuarios.findAll({
        where: {
            [Op.and]:[{super_patrocinador: req.user.enlace_afiliado}]
        }
    })

    res.render('dashboard/adminReporteCargas', {
        nombrePagina : 'Reporte de Cargas',
        titulo: 'Reporte de Cargas',
        breadcrumb: 'Reporte de Cargas',
        classActive: req.path.split('/')[2],
        cargas,
        usuarios
    })
    
}

exports.reporteConsignaciones = async (req, res) => {

    const fecha = req.body.fecha.split(' - ');
    const idUsuarioReporte = req.body.user;
    const fecha1 = moment(fecha[0]).format("YYYY-MM-DD");
    const fecha2 = moment(fecha[1]).format("YYYY-MM-DD");

    if(idUsuarioReporte === '0') {
        var consignaciones = await Consignaciones.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, {fecha: {[Op.gte]: fecha1}}, {fecha: {[Op.lte]: fecha2}}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
            ],
            order: [['fecha', 'DESC']]
        });
    } else {
        var consignaciones = await Consignaciones.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, {usuarioIdUsuario: idUsuarioReporte}, {fecha: {[Op.gte]: fecha1}}, {fecha: {[Op.lte]: fecha2}}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
            ],
            order: [['fecha', 'DESC']]
        });
    }

    // Create a new instance of a Workbook class
    const workbook = new xl.Workbook();
    // Add Worksheets to the workbook
    const worksheet = workbook.addWorksheet('Reporte Consignaciones Superdistribuidor');
    // Create a reusable style
    const style1 = workbook.createStyle({
        font: {
            color: '#401268',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'eaedf7', 
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style2 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style3 = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style4 = workbook.createStyle({
        font: {
            color: '#ffffff',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '6259ca', 
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style5 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
        numberFormat: 'mm/dd/yyyy hh:mm:ss'
    });

    worksheet.column(1).setWidth(45);
    worksheet.column(2).setWidth(20);
    worksheet.column(3).setWidth(20);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(20);
    worksheet.column(6).setWidth(50);
    worksheet.column(7).setWidth(20);
    worksheet.column(8).setWidth(20);
    worksheet.column(9).setWidth(20);

    worksheet.cell(1, 1, 1, 9, true).string('Reporte Consignaciones Superdistribuidor - Fullentretenimiento').style(style4);

    worksheet.cell(2, 1).string('Id consignación').style(style1);
    worksheet.cell(2, 2).string('Usuario cargado').style(style1);
    worksheet.cell(2, 3).string('Valor consignado').style(style1);
    worksheet.cell(2, 4).string('Banco (Tipo consignación)').style(style1);
    worksheet.cell(2, 5).string('No. Referencia').style(style1);
    worksheet.cell(2, 6).string('Observaciones').style(style1);
    worksheet.cell(2, 7).string('Estado').style(style1);
    worksheet.cell(2, 8).string('Fecha reporte').style(style1);
    worksheet.cell(2, 9).string('Fecha de consignación').style(style1);

    for (let i = 0; i < consignaciones.length; i += 1) {
    
        if(consignaciones[i].estado === 1) {
            var estados = 'Aprobada';
        } else if(consignaciones[i].estado === 2) {
            var estados = 'Rechazada';
        } else {
            var estados = 'Sin procesar';
        }

        if(consignaciones[i].observaciones !== null) {
            var observaciones = consignaciones[i].observaciones;
        } else {
            var observaciones = '-';
        }

        worksheet.cell(i + 3, 1).string(consignaciones[i].idConsignacion).style(style2);
        worksheet.cell(i + 3, 2).string(consignaciones[i].usuario.nombre).style(style2);
        worksheet.cell(i + 3, 3).number(Number(consignaciones[i].valor)).style(style3);
        worksheet.cell(i + 3, 4).string(consignaciones[i].tipoConsignacion).style(style2);
        worksheet.cell(i + 3, 5).string(consignaciones[i].referencia).style(style2);
        worksheet.cell(i + 3, 6).string(observaciones).style(style2);
        worksheet.cell(i + 3, 7).string(estados).style(style2);
        worksheet.cell(i + 3, 8).date(consignaciones[i].fecha).style(style5);
        worksheet.cell(i + 3, 9).date(consignaciones[i].fechaHoraConsignacion).style(style5);
    }

    const nombreArchivo = `temp-${shortid.generate()}.xlsx`;
    const nameTemp = `/uploads/temporal/${nombreArchivo}`;
    const url = `${__dirname}/../public${nameTemp}`;
    workbook.write(url);
    // workbook.write(url, function(err, stats) {
    //     if (err) {
    //       console.log('Error: '+err);
    //     } else {
    //       console.log('Status: '+stats);
    //     }
    // });

    res.json({resp: 'success', url: nameTemp, nombre: nombreArchivo});
    return;

}

exports.eliminarArchivo = async (req, res) => {

    fs.unlink(__dirname+'/../public'+req.body.data, () => {
    });

}

exports.reporteCargasSuperdistribuidor = async (req, res) => {

    const fecha = req.body.fecha.split(' - ');
    const idUsuarioReporte = req.body.user;
    const fecha1 = moment(new Date(fecha[0])).format("YYYY-MM-DD");
    const fecha2 = moment(new Date(fecha[1])).format("YYYY-MM-DD");

    if(idUsuarioReporte === '0') {
        var cargas = await Cargas.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, {fechaCarga: {[Op.gte]: fecha1}}, {fechaCarga: {[Op.lte]: fecha2}}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
            ],
            order: [['fechaCarga', 'DESC']]
        });
    } else {
        var cargas = await Cargas.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, {usuarioIdUsuario: idUsuarioReporte}, {fechaCarga: {[Op.gte]: fecha1}}, {fechaCarga: {[Op.lte]: fecha2}}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
            ],
            order: [['fechaCarga', 'DESC']]
        });
    }

    // Create a new instance of a Workbook class
    const workbook = new xl.Workbook();
    // Add Worksheets to the workbook
    const worksheet = workbook.addWorksheet('Reporte Consignaciones Superdistribuidor');
    // Create a reusable style
    const style1 = workbook.createStyle({
        font: {
            color: '#401268',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'eaedf7', 
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style2 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style3 = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style4 = workbook.createStyle({
        font: {
            color: '#ffffff',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '6259ca', 
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style5 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
        numberFormat: 'mm/dd/yyyy hh:mm:ss'
    });

    worksheet.column(1).setWidth(45);
    worksheet.column(2).setWidth(20);
    worksheet.column(3).setWidth(20);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(20);
    worksheet.column(6).setWidth(50);
    worksheet.column(7).setWidth(20);
    worksheet.column(8).setWidth(20);
    worksheet.column(9).setWidth(20);

    worksheet.cell(1, 1, 1, 9, true).string('Reporte Cargas Superdistribuidor - Fullentretenimiento').style(style4);

    worksheet.cell(2, 1).string('Id carga').style(style1);
    worksheet.cell(2, 2).string('Usuario cargado').style(style1);
    worksheet.cell(2, 3).string('Valor carga').style(style1);
    worksheet.cell(2, 4).string('Saldo anterior').style(style1);
    worksheet.cell(2, 5).string('Saldo nuevo').style(style1);
    worksheet.cell(2, 6).string('Tipo de carga').style(style1);
    worksheet.cell(2, 7).string('Acción realizada').style(style1);
    worksheet.cell(2, 8).string('Fecha de carga').style(style1);
    worksheet.cell(2, 9).string('Responsable gestión').style(style1);

    for (let i = 0; i < cargas.length; i += 1) {
    
        if(cargas[i].estado === 1) {
            var estados = 'Aprobada';
        } else if(cargas[i].estado === 2) {
            var estados = 'Rechazada';
        } else {
            var estados = 'Sin procesar';
        }

        if(cargas[i].observaciones !== null) {
            var observaciones = cargas[i].observaciones;
        } else {
            var observaciones = '-';
        }

        if(cargas[i].usuario !== null){
            worksheet.cell(i + 3, 1).string(cargas[i].idCarga).style(style2);
            worksheet.cell(i + 3, 2).string(cargas[i].usuario.nombre).style(style2);
            worksheet.cell(i + 3, 3).number(Number(cargas[i].valor)).style(style3);
            worksheet.cell(i + 3, 4).number(Number(cargas[i].saldoAnterior)).style(style3);
            worksheet.cell(i + 3, 5).number(Number(cargas[i].saldoNuevo)).style(style3);
            worksheet.cell(i + 3, 6).string(cargas[i].tipoCarga).style(style2);
            worksheet.cell(i + 3, 7).string(cargas[i].accionCarga).style(style2);
            worksheet.cell(i + 3, 8).date(cargas[i].fechaCarga).style(style5);
            worksheet.cell(i + 3, 9).string(cargas[i].responsableGestion).style(style2);
        }
    }

    const nombreArchivo = `temp-${shortid.generate()}.xlsx`;
    const nameTemp = `/uploads/temporal/${nombreArchivo}`;
    const url = `${__dirname}/../public${nameTemp}`;
    workbook.write(url);

    res.json({resp: 'success', url: nameTemp, nombre: nombreArchivo});
    return;

}

exports.reporteCuentasSuperdistribuidor = async (req, res) => {

    const fecha = req.body.fecha.split(' - ');
    const idUsuarioReporte = req.body.user;
    const fecha1 = moment(new Date(fecha[0])).format("YYYY-MM-DD");
    const fecha2 = moment(new Date(fecha[1])).format("YYYY-MM-DD");

    if(idUsuarioReporte === '0') {
        var cuentas = await Cuentas.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, {estado:1}, {fechaSubida: {[Op.gte]: fecha1}}, {fechaSubida: {[Op.lte]: fecha2}}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
                {model: Plataformas, foreignKey: 'plataformaIdPlataforma'}
            ],
            order: [['fechaSubida', 'DESC']]
        });
    } else {
        var cuentas = await Cuentas.findAll({
            where: {
                [Op.and]: [{idSuperdistribuidor: req.user.id_usuario}, {estado:1}, {usuarioIdUsuario: idUsuarioReporte}, {fechaSubida: {[Op.gte]: fecha1}}, {fechaSubida: {[Op.lte]: fecha2}}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
                {model: Plataformas, foreignKey: 'plataformaIdPlataforma'}
            ],
            order: [['fechaSubida', 'DESC']]
        });
    }

    const usuarios = await Usuarios.findAll({
        where: {
            [Op.and]:[{super_patrocinador: req.user.enlace_afiliado}]
        }
    })

    // Create a new instance of a Workbook class
    const workbook = new xl.Workbook();
    // Add Worksheets to the workbook
    const worksheet = workbook.addWorksheet('Reporte Cuentas Vendidas Superdistribuidor');
    // Create a reusable style
    const style1 = workbook.createStyle({
        font: {
            color: '#401268',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'eaedf7', 
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style2 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style3 = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style4 = workbook.createStyle({
        font: {
            color: '#ffffff',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '6259ca', 
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style5 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
        numberFormat: 'mm/dd/yyyy hh:mm:ss'
    });

    worksheet.column(1).setWidth(45);
    worksheet.column(2).setWidth(20);
    worksheet.column(3).setWidth(20);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(20);
    worksheet.column(6).setWidth(20);
    worksheet.column(7).setWidth(20);
    worksheet.column(8).setWidth(20);
    worksheet.column(9).setWidth(20);
    worksheet.column(10).setWidth(20);
    worksheet.column(11).setWidth(20);
    worksheet.column(12).setWidth(20);
    worksheet.column(13).setWidth(20);
    worksheet.column(14).setWidth(20);

    worksheet.cell(1, 1, 1, 14, true).string('Reporte Cuentas Vendidas Superdistribuidor - Fullentretenimiento').style(style4);

    worksheet.cell(2, 1).string('Id cuenta').style(style1);
    worksheet.cell(2, 2).string('Distribuidor').style(style1);
    worksheet.cell(2, 3).string('Usuario vendedor').style(style1);
    worksheet.cell(2, 4).string('Perfil usuario').style(style1);
    worksheet.cell(2, 5).string('Plataforma').style(style1);
    worksheet.cell(2, 6).string('Valor pagado').style(style1);
    worksheet.cell(2, 7).string('Tipo plataforma').style(style1);
    worksheet.cell(2, 8).string('User').style(style1);
    worksheet.cell(2, 9).string('Password').style(style1);
    worksheet.cell(2, 10).string('Pantalla').style(style1);
    worksheet.cell(2, 11).string('Pin').style(style1);
    worksheet.cell(2, 12).string('ID Jugador').style(style1);
    worksheet.cell(2, 13).string('Fecha de compra').style(style1);
    worksheet.cell(2, 14).string('Fecha de subida').style(style1);

    for (let i = 0; i < cuentas.length; i += 1) {
    
        if(cuentas[i].estado === 1) {
            var estados = 'Aprobada';
        } else if(cuentas[i].estado === 2) {
            var estados = 'Rechazada';
        } else {
            var estados = 'Sin procesar';
        }

        if(cuentas[i].observaciones !== null) {
            var observaciones = cuentas[i].observaciones;
        } else {
            var observaciones = '-';
        }

        if(cuentas[i].plataforma.tipo_plataforma === 1) {
            var tipoPlataforma = 'Normal';
        } else if(cuentas[i].plataforma.tipo_plataforma === 2) {
            var tipoPlataforma = 'Bajo Pedido';
        } else if(cuentas[i].plataforma.tipo_plataforma === 3) {
            var tipoPlataforma = 'Personalizada';
        } else if(cuentas[i].plataforma.tipo_plataforma === 4) {
            var tipoPlataforma = 'Renovaciones';
        } else if(cuentas[i].plataforma.tipo_plataforma === 5) {
            var tipoPlataforma = 'Juegos';
        } else {
            var tipoPlataforma = 'N/A';
        }

        const distribuidor = await Usuarios.findOne({
            where: {
                [Op.and]:[{id_usuario: cuentas[i].idDistribuidor}]
            }
        })

        const nombreDistribuidor = distribuidor.nombre;

        worksheet.cell(i + 3, 1).string(cuentas[i].idCuenta).style(style2);
        worksheet.cell(i + 3, 2).string(nombreDistribuidor).style(style2);
        worksheet.cell(i + 3, 3).string(cuentas[i].usuario.nombre).style(style2);
        worksheet.cell(i + 3, 4).string(cuentas[i].usuario.perfil).style(style2);
        worksheet.cell(i + 3, 5).string(cuentas[i].plataforma.plataforma).style(style2);
        worksheet.cell(i + 3, 6).number(Number(cuentas[i].valorPagado)).style(style3);
        worksheet.cell(i + 3, 7).string(tipoPlataforma).style(style2);
        worksheet.cell(i + 3, 8).string(cuentas[i].user).style(style2);
        worksheet.cell(i + 3, 9).string(cuentas[i].password).style(style2);
        worksheet.cell(i + 3, 10).string(cuentas[i].pantalla).style(style2);
        worksheet.cell(i + 3, 11).string(cuentas[i].pin).style(style2);
        worksheet.cell(i + 3, 12).string(cuentas[i].idJuego).style(style2);
        worksheet.cell(i + 3, 13).date(cuentas[i].fechaCompra).style(style5);
        worksheet.cell(i + 3, 14).date(cuentas[i].fechaSubida).style(style5);
    }

    const nombreArchivo = `temp-${shortid.generate()}.xlsx`;
    const nameTemp = `/uploads/temporal/${nombreArchivo}`;
    const url = `${__dirname}/../public${nameTemp}`;
    workbook.write(url);

    res.json({resp: 'success', url: nameTemp, nombre: nombreArchivo});
    return;

}

exports.reporteCuentas = async (req, res) => {

    const fecha = req.body.fecha.split(' - ');
    const fecha1 = moment(new Date(fecha[0])).format("YYYY-MM-DD");
    const fecha2 = moment(new Date(fecha[1])).format("YYYY-MM-DD");

    const cuentas = await Cuentas.findAll({
        where: {
            [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, {estado:1}, {fechaSubida: {[Op.gte]: fecha1}}, {fechaSubida: {[Op.lte]: fecha2}}]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
            {model: Plataformas, foreignKey: 'plataformaIdPlataforma'}
        ],
        order: [['fechaSubida', 'DESC']]
    });

    // Create a new instance of a Workbook class
    const workbook = new xl.Workbook();
    // Add Worksheets to the workbook
    const worksheet = workbook.addWorksheet('Reporte Cuentas Vendidas');
    // Create a reusable style
    const style1 = workbook.createStyle({
        font: {
            color: '#401268',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'eaedf7', 
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style2 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style3 = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style4 = workbook.createStyle({
        font: {
            color: '#ffffff',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '6259ca', 
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style5 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
        numberFormat: 'mm/dd/yyyy hh:mm:ss'
    });

    worksheet.column(1).setWidth(45);
    worksheet.column(2).setWidth(20);
    worksheet.column(3).setWidth(20);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(20);
    worksheet.column(6).setWidth(20);
    worksheet.column(7).setWidth(20);
    worksheet.column(8).setWidth(20);
    worksheet.column(9).setWidth(20);
    worksheet.column(10).setWidth(20);
    worksheet.column(11).setWidth(20);

    worksheet.cell(1, 1, 1, 11, true).string('Reporte Cuentas Vendidas - Fullentretenimiento').style(style4);

    worksheet.cell(2, 1).string('Id cuenta').style(style1);
    worksheet.cell(2, 2).string('Plataforma').style(style1);
    worksheet.cell(2, 3).string('Valor pagado').style(style1);
    worksheet.cell(2, 4).string('Tipo plataforma').style(style1);
    worksheet.cell(2, 5).string('User').style(style1);
    worksheet.cell(2, 6).string('Password').style(style1);
    worksheet.cell(2, 7).string('Pantalla').style(style1);
    worksheet.cell(2, 8).string('Pin').style(style1);
    worksheet.cell(2, 9).string('ID Juegador').style(style1);
    worksheet.cell(2, 10).string('Fecha de compra').style(style1);
    worksheet.cell(2, 11).string('Fecha de subida').style(style1);

    for (let i = 0; i < cuentas.length; i += 1) {
    
        if(cuentas[i].estado === 1) {
            var estados = 'Aprobada';
        } else if(cuentas[i].estado === 2) {
            var estados = 'Rechazada';
        } else {
            var estados = 'Sin procesar';
        }

        if(cuentas[i].observaciones !== null) {
            var observaciones = cuentas[i].observaciones;
        } else {
            var observaciones = '-';
        }

        if(cuentas[i].plataforma.tipo_plataforma === 1) {
            var tipoPlataforma = 'Normal';
        } else if(cuentas[i].plataforma.tipo_plataforma === 2) {
            var tipoPlataforma = 'Bajo Pedido';
        } else if(cuentas[i].plataforma.tipo_plataforma === 3) {
            var tipoPlataforma = 'Personalizada';
        } else if(cuentas[i].plataforma.tipo_plataforma === 4) {
            var tipoPlataforma = 'Renovaciones';
        } else if(cuentas[i].plataforma.tipo_plataforma === 5) {
            var tipoPlataforma = 'Juegos';
        } else {
            var tipoPlataforma = 'N/A';
        }

       if(cuentas[i].plataforma.tipo_plataforma === 5) {
           if(cuentas[i].user !== null || cuentas[i].password !== null) {
               const user_analizado = /^([^]+)@(\w+).(\w+)$/.exec(cuentas[i].user);
               const [,prefijo,servidor,dominio] = user_analizado;
               const reemplazo = prefijo.replace(/./g,"*");
               var nuevo_email_user = `${reemplazo}@${servidor}.${dominio}`;
               var nuevo_password = cuentas[i].password.replace(/./g,"*");
               var idJuego = 'no aplica' 
           } else {
               var nuevo_email_user = 'no aplica'
               var nuevo_password = 'no aplica'
               var idJuego = cuentas[i].idJuego 
           }   
       } else {
           var nuevo_email_user = cuentas[i].user;
           var nuevo_password = cuentas[i].password;
           var idJuego = 'no aplica' 
       }

        worksheet.cell(i + 3, 1).string(cuentas[i].idCuenta).style(style2);
        worksheet.cell(i + 3, 2).string(cuentas[i].plataforma.plataforma).style(style2);
        worksheet.cell(i + 3, 3).number(Number(cuentas[i].valorPagado)).style(style3);
        worksheet.cell(i + 3, 4).string(tipoPlataforma).style(style2);
        worksheet.cell(i + 3, 5).string(nuevo_email_user).style(style2);
        worksheet.cell(i + 3, 6).string(nuevo_password).style(style2);
        worksheet.cell(i + 3, 7).string(cuentas[i].pantalla).style(style2);
        worksheet.cell(i + 3, 8).string(cuentas[i].pin).style(style2);
        worksheet.cell(i + 3, 9).string(idJuego).style(style2);
        worksheet.cell(i + 3, 10).date(cuentas[i].fechaCompra).style(style5);
        worksheet.cell(i + 3, 11).date(cuentas[i].fechaSubida).style(style5);
    }

    const nombreArchivo = `temp-${shortid.generate()}.xlsx`;
    const nameTemp = `/uploads/temporal/${nombreArchivo}`;
    const url = `${__dirname}/../public${nameTemp}`;
    workbook.write(url);

    res.json({resp: 'success', url: nameTemp, nombre: nombreArchivo});
    return;

}

exports.reporteConsignacionesUser = async (req, res) => {

    const fecha = req.body.fecha.split(' - ');
    const fecha1 = moment(new Date(fecha[0])).format("YYYY-MM-DD");
    const fecha2 = moment(new Date(fecha[1])).format("YYYY-MM-DD");

    const consignaciones = await Consignaciones.findAll({
        where: {
            [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, {fecha: {[Op.gte]: fecha1}}, {fecha: {[Op.lte]: fecha2}}]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
        ],
        order: [['fecha', 'DESC']]
    });

    // Create a new instance of a Workbook class
    const workbook = new xl.Workbook();
    // Add Worksheets to the workbook
    const worksheet = workbook.addWorksheet('Reporte Consignaciones');
    // Create a reusable style
    const style1 = workbook.createStyle({
        font: {
            color: '#401268',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'eaedf7', 
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style2 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style3 = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style4 = workbook.createStyle({
        font: {
            color: '#ffffff',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '6259ca', 
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style5 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
        numberFormat: 'mm/dd/yyyy hh:mm:ss'
    });

    worksheet.column(1).setWidth(45);
    worksheet.column(2).setWidth(20);
    worksheet.column(3).setWidth(20);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(20);
    worksheet.column(6).setWidth(50);
    worksheet.column(7).setWidth(20);
    worksheet.column(8).setWidth(20);
    worksheet.column(9).setWidth(20);

    worksheet.cell(1, 1, 1, 9, true).string('Reporte Consignaciones - Fullentretenimiento').style(style4);

    worksheet.cell(2, 1).string('Id consignación').style(style1);
    worksheet.cell(2, 2).string('Usuario cargado').style(style1);
    worksheet.cell(2, 3).string('Valor consignado').style(style1);
    worksheet.cell(2, 4).string('Banco (Tipo consignación)').style(style1);
    worksheet.cell(2, 5).string('No. Referencia').style(style1);
    worksheet.cell(2, 6).string('Observaciones').style(style1);
    worksheet.cell(2, 7).string('Estado').style(style1);
    worksheet.cell(2, 8).string('Fecha reporte').style(style1);
    worksheet.cell(2, 9).string('Fecha de consignación').style(style1);

    for (let i = 0; i < consignaciones.length; i += 1) {
    
        if(consignaciones[i].estado === 1) {
            var estados = 'Aprobada';
        } else if(consignaciones[i].estado === 2) {
            var estados = 'Rechazada';
        } else {
            var estados = 'Sin procesar';
        }

        if(consignaciones[i].observaciones !== null) {
            var observaciones = consignaciones[i].observaciones;
        } else {
            var observaciones = '-';
        }

        worksheet.cell(i + 3, 1).string(consignaciones[i].idConsignacion).style(style2);
        worksheet.cell(i + 3, 2).string(consignaciones[i].usuario.nombre).style(style2);
        worksheet.cell(i + 3, 3).number(Number(consignaciones[i].valor)).style(style3);
        worksheet.cell(i + 3, 4).string(consignaciones[i].tipoConsignacion).style(style2);
        worksheet.cell(i + 3, 5).string(consignaciones[i].referencia).style(style2);
        worksheet.cell(i + 3, 6).string(observaciones).style(style2);
        worksheet.cell(i + 3, 7).string(estados).style(style2);
        worksheet.cell(i + 3, 8).date(consignaciones[i].fecha).style(style5);
        worksheet.cell(i + 3, 9).date(consignaciones[i].fechaHoraConsignacion).style(style5);
    }

    const nombreArchivo = `temp-${shortid.generate()}.xlsx`;
    const nameTemp = `/uploads/temporal/${nombreArchivo}`;
    const url = `${__dirname}/../public${nameTemp}`;
    workbook.write(url);

    res.json({resp: 'success', url: nameTemp, nombre: nombreArchivo});
    return;

}

exports.reporteCompras = async (req, res) => {

    const cargas = await Cargas.findAll({
        where: {
            [Op.and]:[{usuarioIdUsuario: req.user.id_usuario}]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
        ],
        order: [['fechaCarga', 'DESC']]
    })

    res.render('dashboard/reporteCompras', {
        nombrePagina : 'Reporte de Compras de saldo',
        titulo: 'Reporte de Compras de saldo',
        breadcrumb: 'Reporte de Compras de saldo',
        classActive: req.path.split('/')[2],
        cargas,
    })

}

exports.reporteComprasSaldo = async (req, res) => {

    const fecha = req.body.fecha.split(' - ');
    const fecha1 = moment(new Date(fecha[0])).format("YYYY-MM-DD");
    const fecha2 = moment(new Date(fecha[1])).format("YYYY-MM-DD");

    const cargas = await Cargas.findAll({
        where: {
            [Op.and]: [{usuarioIdUsuario: req.user.id_usuario}, {fechaCarga: {[Op.gte]: fecha1}}, {fechaCarga: {[Op.lte]: fecha2}}]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
        ],
        order: [['fechaCarga', 'DESC']]
    });

    // Create a new instance of a Workbook class
    const workbook = new xl.Workbook();
    // Add Worksheets to the workbook
    const worksheet = workbook.addWorksheet('Reporte compras de saldo');
    // Create a reusable style
    const style1 = workbook.createStyle({
        font: {
            color: '#401268',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'eaedf7', 
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style2 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style3 = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style4 = workbook.createStyle({
        font: {
            color: '#ffffff',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '6259ca', 
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style5 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
        numberFormat: 'mm/dd/yyyy hh:mm:ss'
    });

    worksheet.column(1).setWidth(45);
    worksheet.column(2).setWidth(20);
    worksheet.column(3).setWidth(20);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(20);
    worksheet.column(6).setWidth(50);
    worksheet.column(7).setWidth(20);
    worksheet.column(8).setWidth(20);

    worksheet.cell(1, 1, 1, 8, true).string('Reporte compras de saldo - Fullentretenimiento').style(style4);

    worksheet.cell(2, 1).string('Id carga').style(style1);
    worksheet.cell(2, 2).string('Usuario cargado').style(style1);
    worksheet.cell(2, 3).string('Valor carga').style(style1);
    worksheet.cell(2, 4).string('Saldo anterior').style(style1);
    worksheet.cell(2, 5).string('Saldo nuevo').style(style1);
    worksheet.cell(2, 6).string('Tipo de carga').style(style1);
    worksheet.cell(2, 7).string('Acción realizada').style(style1);
    worksheet.cell(2, 8).string('Fecha de carga').style(style1);

    for (let i = 0; i < cargas.length; i += 1) {
    
        if(cargas[i].estado === 1) {
            var estados = 'Aprobada';
        } else if(cargas[i].estado === 2) {
            var estados = 'Rechazada';
        } else {
            var estados = 'Sin procesar';
        }

        if(cargas[i].observaciones !== null) {
            var observaciones = cargas[i].observaciones;
        } else {
            var observaciones = '-';
        }

        worksheet.cell(i + 3, 1).string(cargas[i].idCarga).style(style2);
        worksheet.cell(i + 3, 2).string(cargas[i].usuario.nombre).style(style2);
        worksheet.cell(i + 3, 3).number(Number(cargas[i].valor)).style(style3);
        worksheet.cell(i + 3, 4).number(Number(cargas[i].saldoAnterior)).style(style3);
        worksheet.cell(i + 3, 5).number(Number(cargas[i].saldoNuevo)).style(style3);
        worksheet.cell(i + 3, 6).string(cargas[i].tipoCarga).style(style2);
        worksheet.cell(i + 3, 7).string(cargas[i].accionCarga).style(style2);
        worksheet.cell(i + 3, 8).date(cargas[i].fechaCarga).style(style5);
    }

    const nombreArchivo = `temp-${shortid.generate()}.xlsx`;
    const nameTemp = `/uploads/temporal/${nombreArchivo}`;
    const url = `${__dirname}/../public${nameTemp}`;
    workbook.write(url);

    res.json({resp: 'success', url: nameTemp, nombre: nombreArchivo});
    return;

}

exports.reporteVentas = async (req, res) => {

    const cargas = await Cargas.findAll({
        where: {
            [Op.and]:[{responsableGestion: req.user.nombre}]
        },
        include: [
            {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
        ],
        order: [['fechaCarga', 'DESC']]
    })

    const usuarios = await Usuarios.findAll({
        where: {
            [Op.and]:[{patrocinador: req.user.enlace_afiliado}]
        }
    })

    res.render('dashboard/reporteVentas', {
        nombrePagina : 'Reporte ventas de saldo',
        titulo: 'Reporte ventas de saldo',
        breadcrumb: 'Reporte ventas de saldo',
        classActive: req.path.split('/')[2],
        cargas,
        usuarios
    })

}

exports.reporteVentasSaldo = async (req, res) => {

    const fecha = req.body.fecha.split(' - ');
    const idUsuarioReporte = req.body.user;
    const fecha1 = moment(new Date(fecha[0])).format("YYYY-MM-DD");
    const fecha2 = moment(new Date(fecha[1])).format("YYYY-MM-DD");

    if(idUsuarioReporte === '0') {
        var cargas = await Cargas.findAll({
            where: {
                [Op.and]: [{responsableGestion: req.user.nombre}, {fechaCarga: {[Op.gte]: fecha1}}, {fechaCarga: {[Op.lte]: fecha2}}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
            ],
            order: [['fechaCarga', 'DESC']]
        });
    } else {
        var cargas = await Cargas.findAll({
            where: {
                [Op.and]: [{responsableGestion: req.user.nombre}, {usuarioIdUsuario: idUsuarioReporte}, {fechaCarga: {[Op.gte]: fecha1}}, {fechaCarga: {[Op.lte]: fecha2}}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'}
            ],
            order: [['fechaCarga', 'DESC']]
        });
    }

    // Create a new instance of a Workbook class
    const workbook = new xl.Workbook();
    // Add Worksheets to the workbook
    const worksheet = workbook.addWorksheet('Reporte Ventas Saldo');
    // Create a reusable style
    const style1 = workbook.createStyle({
        font: {
            color: '#401268',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'eaedf7', 
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style2 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style3 = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style4 = workbook.createStyle({
        font: {
            color: '#ffffff',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '6259ca', 
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style5 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
        numberFormat: 'mm/dd/yyyy hh:mm:ss'
    });

    worksheet.column(1).setWidth(45);
    worksheet.column(2).setWidth(20);
    worksheet.column(3).setWidth(20);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(20);
    worksheet.column(6).setWidth(50);
    worksheet.column(7).setWidth(20);
    worksheet.column(8).setWidth(20);
    worksheet.column(9).setWidth(20);

    worksheet.cell(1, 1, 1, 9, true).string('Reporte ventas saldo - Fullentretenimiento').style(style4);

    worksheet.cell(2, 1).string('Id carga').style(style1);
    worksheet.cell(2, 2).string('Usuario cargado').style(style1);
    worksheet.cell(2, 3).string('Valor carga').style(style1);
    worksheet.cell(2, 4).string('Saldo anterior').style(style1);
    worksheet.cell(2, 5).string('Saldo nuevo').style(style1);
    worksheet.cell(2, 6).string('Tipo de carga').style(style1);
    worksheet.cell(2, 7).string('Acción realizada').style(style1);
    worksheet.cell(2, 8).string('Fecha de carga').style(style1);
    worksheet.cell(2, 9).string('Responsable gestión').style(style1);

    for (let i = 0; i < cargas.length; i += 1) {
    
        if(cargas[i].estado === 1) {
            var estados = 'Aprobada';
        } else if(cargas[i].estado === 2) {
            var estados = 'Rechazada';
        } else {
            var estados = 'Sin procesar';
        }

        if(cargas[i].observaciones !== null) {
            var observaciones = cargas[i].observaciones;
        } else {
            var observaciones = '-';
        }

        worksheet.cell(i + 3, 1).string(cargas[i].idCarga).style(style2);
        worksheet.cell(i + 3, 2).string(cargas[i].usuario.nombre).style(style2);
        worksheet.cell(i + 3, 3).number(Number(cargas[i].valor)).style(style3);
        worksheet.cell(i + 3, 4).number(Number(cargas[i].saldoAnterior)).style(style3);
        worksheet.cell(i + 3, 5).number(Number(cargas[i].saldoNuevo)).style(style3);
        worksheet.cell(i + 3, 6).string(cargas[i].tipoCarga).style(style2);
        worksheet.cell(i + 3, 7).string(cargas[i].accionCarga).style(style2);
        worksheet.cell(i + 3, 8).date(cargas[i].fechaCarga).style(style5);
        worksheet.cell(i + 3, 9).string(cargas[i].responsableGestion).style(style2);
    }

    const nombreArchivo = `temp-${shortid.generate()}.xlsx`;
    const nameTemp = `/uploads/temporal/${nombreArchivo}`;
    const url = `${__dirname}/../public${nameTemp}`;
    workbook.write(url);

    res.json({resp: 'success', url: nameTemp, nombre: nombreArchivo});
    return;

}

exports.reporteGanancias = async (req, res) => {

    const fecha = req.body.fecha.split(' - ');
    const idUsuarioReporte = req.body.user;
    const fecha1 = moment(new Date(fecha[0])).format("YYYY-MM-DD");
    const fecha2 = moment(new Date(fecha[1])).format("YYYY-MM-DD");

    if(idUsuarioReporte === '0' || idUsuarioReporte === 0) {
        var ganancias = await Ganancias.findAll({
            where: {
                [Op.and]: [{fecha: {[Op.gte]: fecha1}}, {fecha: {[Op.lte]: fecha2}}, {distribuidor: req.user.id_usuario}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
                {model: Plataformas, foreignKey: 'plataformaIdPlataforma'},
            ],
            order: [['fecha', 'DESC']]
        });
    } else {
        var ganancias = await Ganancias.findAll({
            where: {
                [Op.and]: [{usuarioIdUsuario: idUsuarioReporte}, {fecha: {[Op.gte]: fecha1}}, {fecha: {[Op.lte]: fecha2}}, {distribuidor: req.user.id_usuario}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
                {model: Plataformas, foreignKey: 'plataformaIdPlataforma'},
            ],
            order: [['fecha', 'DESC']]
        });
    }

    // Create a new instance of a Workbook class
    const workbook = new xl.Workbook();
    // Add Worksheets to the workbook
    const worksheet = workbook.addWorksheet('Reporte ganancias');
    // Create a reusable style
    const style1 = workbook.createStyle({
        font: {
            color: '#401268',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'eaedf7', 
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style2 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style3 = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style4 = workbook.createStyle({
        font: {
            color: '#ffffff',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '6259ca', 
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style5 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
        numberFormat: 'mm/dd/yyyy hh:mm:ss'
    });

    worksheet.column(1).setWidth(45);
    worksheet.column(2).setWidth(20);
    worksheet.column(3).setWidth(20);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(20);
    worksheet.column(6).setWidth(50);

    worksheet.cell(1, 1, 1, 6, true).string('Reporte ganancias - Fullentretenimiento').style(style4);

    worksheet.cell(2, 1).string('Nombre distribuidor').style(style1);
    worksheet.cell(2, 2).string('Nombre vendedor').style(style1);
    worksheet.cell(2, 3).string('Perfil vendedor').style(style1);
    worksheet.cell(2, 4).string('Plataforma').style(style1);
    worksheet.cell(2, 5).string('Ganancia carga').style(style1);
    worksheet.cell(2, 6).string('Fecha').style(style1);

    for (let i = 0; i < ganancias.length; i += 1) {

        const distribuidor = await Usuarios.findOne({
            where: {
                [Op.and]:[{id_usuario: ganancias[i].distribuidor}]
            }
        })
    
        const nombreDistribuidor = distribuidor.nombre;
        if(ganancias[i].usuario !== null || ganancias[i].plataforma !== null){
            worksheet.cell(i + 3, 1).string(nombreDistribuidor).style(style2);
            worksheet.cell(i + 3, 2).string(ganancias[i].usuario.nombre).style(style2);
            worksheet.cell(i + 3, 3).string(ganancias[i].usuario.perfil).style(style2);
            worksheet.cell(i + 3, 4).string(ganancias[i].plataforma.plataforma).style(style2);
            worksheet.cell(i + 3, 5).number(Number(ganancias[i].ganancia)).style(style3);
            worksheet.cell(i + 3, 6).date(ganancias[i].fecha).style(style5);
        }
    }

    const nombreArchivo = `temp-${shortid.generate()}.xlsx`;
    const nameTemp = `/uploads/temporal/${nombreArchivo}`;
    const url = `${__dirname}/../public${nameTemp}`;
    workbook.write(url);

    res.json({resp: 'success', url: nameTemp, nombre: nombreArchivo});
    return;

}

exports.reporteConsignacionesDistribuidor = async (req, res) => {

    const fecha = req.body.fecha.split(' - ');
    const idUsuarioReporte = req.body.user;
    const fecha1 = moment(new Date(fecha[0])).format("YYYY-MM-DD");
    const fecha2 = moment(new Date(fecha[1])).format("YYYY-MM-DD");

    if(idUsuarioReporte === '0' || idUsuarioReporte === 0) {
        var ganancias = await Ganancias.findAll({
            where: {
                [Op.and]: [{fecha: {[Op.gte]: fecha1}}, {fecha: {[Op.lte]: fecha2}}, {distribuidor: req.user.id_usuario}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
                {model: Plataformas, foreignKey: 'plataformaIdPlataforma'},
            ],
            order: [['fecha', 'DESC']]
        });
    } else {
        var ganancias = await Ganancias.findAll({
            where: {
                [Op.and]: [{usuarioIdUsuario: idUsuarioReporte}, {fecha: {[Op.gte]: fecha1}}, {fecha: {[Op.lte]: fecha2}}, {distribuidor: req.user.id_usuario}]
            },
            include: [
                {model: Usuarios, foreignKey: 'usuarioIdUsuario'},
                {model: Plataformas, foreignKey: 'plataformaIdPlataforma'},
            ],
            order: [['fecha', 'DESC']]
        });
    }

    // Create a new instance of a Workbook class
    const workbook = new xl.Workbook();
    // Add Worksheets to the workbook
    const worksheet = workbook.addWorksheet('Reporte ganancias');
    // Create a reusable style
    const style1 = workbook.createStyle({
        font: {
            color: '#401268',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: 'eaedf7', 
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style2 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style3 = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style4 = workbook.createStyle({
        font: {
            color: '#ffffff',
            bold: true,
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '6259ca', 
        },
        alignment: {
            wrapText: true,
            horizontal: 'center',
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
    });

    const style5 = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
        },
        numberFormat: 'mm/dd/yyyy hh:mm:ss'
    });

    worksheet.column(1).setWidth(45);
    worksheet.column(2).setWidth(20);
    worksheet.column(3).setWidth(20);
    worksheet.column(4).setWidth(25);
    worksheet.column(5).setWidth(20);

    worksheet.cell(1, 1, 1, 5, true).string('Reporte ganancias - Fullentretenimiento').style(style4);

    worksheet.cell(2, 1).string('Nombre vendedor').style(style1);
    worksheet.cell(2, 2).string('Perfil vendedor').style(style1);
    worksheet.cell(2, 3).string('Plataforma').style(style1);
    worksheet.cell(2, 4).string('Ganancia carga').style(style1);
    worksheet.cell(2, 5).string('Fecha').style(style1);

    for (let i = 0; i < ganancias.length; i += 1) {

        if(ganancias[i].usuario !== null || ganancias[i].plataforma !== null){
            worksheet.cell(i + 3, 1).string(ganancias[i].usuario.nombre).style(style2);
            worksheet.cell(i + 3, 2).string(ganancias[i].usuario.perfil).style(style2);
            worksheet.cell(i + 3, 3).string(ganancias[i].plataforma.plataforma).style(style2);
            worksheet.cell(i + 3, 4).number(Number(ganancias[i].ganancia)).style(style3);
            worksheet.cell(i + 3, 5).date(ganancias[i].fecha).style(style5);
        }
    }

    const nombreArchivo = `temp-${shortid.generate()}.xlsx`;
    const nameTemp = `/uploads/temporal/${nombreArchivo}`;
    const url = `${__dirname}/../public${nameTemp}`;
    workbook.write(url);

    res.json({resp: 'success', url: nameTemp, nombre: nombreArchivo});
    return;

}
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

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


// Qr render
exports.qrrender = async (req, res) => {

    const datos = req.body; 
    const dom = DOMPurify.sanitize(datos.inputUrlSanitize);
    // Converting the data into String format
    let stringdata = JSON.stringify(dom)
    
    // Print the QR code to terminal
    QRCode.toString(stringdata,{type:'terminal'},
                        function (err, QRcode) {
    
        if(err) return console.log("error occurred")
    
        // Printing the generated code

    })
    // Converting the data into base64
    QRCode.toDataURL(stringdata, function (err, code) {
        if(err) return console.log("error occurred")
        codigoqr64 = code
        try {
            //aprender
                MediosPago.create({
                  nombre:  datos.inputNombre,
                  wallet:dom,
                  codigoQR: code,
                  usuarioIdUsuario: req.user.id_usuario
                });
                // console.log('creando usuario');
              } 
        catch (error) {
            console.log(error);
        }
    });
    res.json({ titulo: '¡Excelente!', resp: 'success', descripcion: 'Medio de pago creado con exito.' });

  };
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const QRCode = require('qrcode')
const {mediosPago} = require('../models/mediosPagoModelo');

console.log(mediosPago)
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
                 mediosPago.create({
                  nombre:  datos.inputNombre,
                  wallet:dom,
                  codigoQR: code,
                });
                // console.log('creando usuario');
              } 
        catch (error) {
            console.log(error);
        }
        
        // Printing the code
        
    })
   
    
   
  
  };
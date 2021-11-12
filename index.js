const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const axios = require("axios");
const routes = require("./routes");
const socketIO = require("socket.io");
const moment = require("moment");
const timeout = require("connect-timeout");
// const formData = require("express-form-data");

// crear conexion ala DB
const db = require("./config/db");

// Importar modelo
require("./models/usuariosModelo");
// require('./models/plataformasModelo');
// require('./models/marcasModelo');
// require('./models/asignacionesModelo');
// require('./models/cuentasModelo');
// require('./models/gananciasModelo');
// require('./models/consignacionesModelo');
// require('./models/mediosModelo');
// require('./models/linksPseModelo');
// require('./models/insidenciasModelo');
// require('./models/cargasModelo');
// require('./models/preguntasModelo');
// require('./models/publicidadModelo');

db.sync()
  .then(() => console.log("Conectado a la base de datos"))
  .catch((error) => console.log(error));

// Variables de entorno
dotenv.config({
  path: path.resolve(__dirname, "development.env"),
});

// crear el servidor
const app = express();

// habilitar EJS
// app.use(expressLayouts);
app.set("view engine", "ejs");

// ubicacion vistas
app.set("views", path.join(__dirname, "./views"));

// archivos estaticos
app.use(express.static("public"));

// habilitar cookie parser
app.use(cookieParser());

// crear session
app.use(
  session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
  })
);

// inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Agregar flash messages
app.use(flash());

// Middleware's (usuario logueado, flash messages, fecha actual)
app.use(async (req, res, next) => {
  res.locals.usuario = { ...req.user } || null;
  res.locals.mensajes = req.flash();
  const paises = await axios.get(
    "http://" + req.headers.host + "/assetsDashboard/json/paises.json"
  );
  res.locals.paises = paises;
  const fecha = new Date();
  res.locals.year = fecha.getFullYear();
  res.locals.fecha = fecha.toLocaleString("es-CO");
  res.locals.moment = moment;
  next();
});

// habilitar bodyparser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(formData.parse());

// Rutas de la app
app.use("/", routes());

// Error 404
app.get("*", function (req, res) {
  res.status(404).render("404", {
    nombrePagina: "Pagina no encontrada",
  });
});

// puerto
const puerto = process.env.PORT || 5004;
const server = app.listen(puerto, () => {
  console.log(`Corriendo correctamente en el puerto ${puerto}`);
});

// // Socket
// const io = socketIO(server);

// // websockets
// io.on('connection', () => {
//     console.log('Nueva conexión');
// });

const express = require('express');
const router = express.Router();

// importar controladores
const generalController = require('../controllers/generalController');
const authController = require('../controllers/authController');
const rolController = require('../controllers/rolController');

// Controladores Usuarios por Rol
const dashboardController = require('../controllers/dashboardController');
const usuariosController = require('../controllers/usuariosController');
const plataformasController = require('../controllers/plataformasController');
const marcasController = require('../controllers/marcasController');
const comprarPlataformasController = require('../controllers/comprarPlataformasController');
const cuentasController = require('../controllers/cuentasController');
const notificacionesController = require('../controllers/notificacionesController');
const consignacionesController = require('../controllers/consignacionesController');
const mediosController = require('../controllers/mediosController');
const linkPseController = require('../controllers/linkPseController');
const insidenciasController = require('../controllers/insidenciasController');
const preguntasController = require('../controllers/preguntasController');
const reportesController = require('../controllers/reportesController');
const gananciasController = require('../controllers/gananciasController');
const publicidadController = require('../controllers/publicidadController');

module.exports = function() {

    // Inicio
    router.get('/', generalController.inicio);
    router.get('/inicio', generalController.inicio);
    
    // Crear y confirmar cuenta usuario
    router.get('/registro', 
        generalController.formRegistro,
    );

    router.post('/registra-user', generalController.uploadArchivo, generalController.validarRegistro, generalController.crearRegistro,);
    router.get('/confirmar-cuenta/:correo', generalController.confirmarCuenta);
    
    // Ingreso
    router.get('/ingreso', generalController.formIngreso);
    router.post('/ingreso', authController.autenticarUsuario);
    router.post('/ingreso/recuperarPassword', generalController.recuperarPasswords);
    
    // =====================
    //     Dashboard
    // =====================

    // Inicio
    router.get('/dashboard/inicio', 
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.inicio
    );

    // Perfil
    router.get('/dashboard/mi-perfil', 
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.perfil
    );
    router.post('/dashboard/mi-perfil/cambiarPassword',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.cambiarPassword
    );
    router.post('/dashboard/mi-perfil/editar/:correo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.validarEditarPerfil,
        dashboardController.editarPerfil
    );
    router.post('/dashboard/mi-perfil/editar-redes/:correo', 
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.editarRedesSociales
    );
    router.post('/dashboard/mi-perfil/subir-foto/:correo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        dashboardController.uploadFoto,
        dashboardController.subirFoto
    );

    // Cerrar Sesion
    router.get('/cerrar-sesion', (req, res) => {
        req.logout();
        res.redirect('/ingreso');
    });

    // =====================
    //    Paginas Admin
    // =====================

    // Administrador Usuarios (Admin)
    router.get('/dashboard/comercios',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        usuariosController.comercios
    );

    router.post('/adminUsuarios/cambioPefil',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        usuariosController.cambioPerfil
    );

    router.post('/adminUsuarios/bloqueoUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        usuariosController.bloqueoUsuario
    );

    router.post('/adminUsuarios/editarUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        usuariosController.editarUsuario
    );

    router.post('/adminUsuarios/eliminarUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        usuariosController.eliminarUsuario
    );

    router.post('/adminUsuarios/tablaAsignarPlataformas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        usuariosController.tablaAsignarPlataformas
    );

    router.post('/adminUsuarios/asignarPlataformas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        usuariosController.asignarPlataformaSuperdistribuidor
    );


    // Administrador Plataformas (Admin)
    router.get('/dashboard/adminPlataformas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        plataformasController.adminPlataformas
    );

    router.post('/adminPlataformas/crearPlataforma',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        plataformasController.uploadFoto,
        plataformasController.crearPlataforma
    );

    router.post('/adminPlataformas/editarPlataforma',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        plataformasController.editarPlataforma
    );

    router.post('/adminPlataformas/eliminarPlataforma',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        plataformasController.eliminarPlataforma
    );

    router.post('/adminPlataformas/cambioEstado',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        plataformasController.cambioEstado
    );

    // Administrador Marcas Blancas (Admin)
    router.get('/dashboard/adminMarcasBlancas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        marcasController.adminMarcasBlancas
    );

    router.post('/adminMarcasBlancas/crearMarca',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        marcasController.uploadLogo,
        marcasController.crearMarca
    );

    router.post('/adminMarcasBlancas/editarMarca',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        marcasController.editarMarca
    );

    router.post('/adminMarcasBlancas/eliminarMarca',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        marcasController.eliminarMarca
    );

    router.post('/adminMarcasBlancas/cambioEstado',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaAdmin,
        marcasController.cambioEstado
    );

    // ===============================
    //    Paginas SuperDistribuidor
    // ===============================

    // Administrador Usuarios (Admin)
    router.get('/dashboard/adminUsuariosSuperdistribuidor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        usuariosController.adminUsuariosSuperdistribuidor
    );

    router.post('/adminUsuariosSuperdistribuidor/cambioPefil',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        usuariosController.cambioPerfil
    );

    router.post('/adminUsuariosSuperdistribuidor/bloqueoUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        usuariosController.bloqueoUsuario
    );

    router.post('/adminUsuariosSuperdistribuidor/editarUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        usuariosController.editarUsuario
    );

    router.post('/adminUsuariosSuperdistribuidor/eliminarUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        usuariosController.eliminarUsuario
    );

    router.post('/adminUsuariosSuperdistribuidor/cargarSaldo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        usuariosController.cargarSaldo
    );


    router.post('/adminUsuariosSuperdistribuidor/restarSaldo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        usuariosController.restarSaldo
    );

    router.post('/adminUsuariosSuperdistribuidor/tablaAsignarPlataformas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        usuariosController.tablaAsignarPlataformas
    );

    router.post('/adminUsuariosSuperdistribuidor/asignarPlataformas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        usuariosController.asignarPlataformaSuperdistribuidor
    );


    // Administrador Plataformas (Superdistribuidor)
    router.get('/dashboard/adminPlataformasSuperdistribuidor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        plataformasController.adminPlataformasSuperdistribuidor
    );

    router.post('/adminPlataformasSuperdistribuidor/editarLogo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        plataformasController.uploadFoto,
        plataformasController.editarLogo
    );

    router.post('/adminPlataformasSuperdistribuidor/crearPlataformaSuperdistribuidor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        plataformasController.uploadFoto,
        plataformasController.crearPlataformaSuperdistribuidor
    );

    router.post('/adminPlataformasSuperdistribuidor/editarPlataforma',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        plataformasController.editarPlataforma
    );

    router.post('/adminPlataformasSuperdistribuidor/eliminarPlataformaSuperdistribuidor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        plataformasController.eliminarPlataformaSuperdistribuidor
    );

    router.post('/adminPlataformasSuperdistribuidor/cambioEstado',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        plataformasController.cambioEstado
    );

    router.post('/adminPlataformasSuperdistribuidor/desplegarPlataformas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        plataformasController.desplegarPlataformas
    );

    router.post('/adminPlataformasSuperdistribuidor/subirValor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        plataformasController.subirValor
    );

    router.post('/adminPlataformasSuperdistribuidor/bajarValor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        plataformasController.bajarValor
    );


    // Subir Cuentas (Superdistribuidor)
    router.get('/dashboard/subirCuentas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.subirCuentas
    );

    router.post('/subirCuentas/subirCuentasExcel',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.uploadExcel,
        cuentasController.subirCuentasExcel
    );

    router.post('/subirCuentas/editarCuenta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.editarCuenta
    );

    router.post('/subirCuentas/eliminarCuenta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.eliminarCuenta
    );


    // Subir Cuentas (Superdistribuidor)
    router.get('/dashboard/cuentasSinTomar',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.cuentasSinTomar
    );

    // Medios de consignacion (Superdistribuidor)
    router.get('/dashboard/mediosConsignacion',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        mediosController.mediosConsignacion
    );

    router.post('/mediosConsignacion/subirMedio',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        mediosController.uploadRecursos,
        mediosController.subirMedio
    );

    router.post('/mediosConsignacion/infoMedio',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        mediosController.infoMedio
    );

    router.post('/mediosConsignacion/editarMedio',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        mediosController.editarMedio
    );

    router.post('/mediosConsignacion/bloquearMedio',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        mediosController.bloquearMedio
    );

    router.post('/mediosConsignacion/eliminarMedio',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        mediosController.eliminarMedio
    );

    // Administración de cuentas

    router.get('/dashboard/adminCuentasVendidas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.adminCuentasVendidas
    );

    // Administracion cuentas bajo pedido

    router.get('/dashboard/adminCuentasBajoPedido',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.adminCuentasBajoPedido
    );

    router.post('/adminCuentasBajoPedido/infoCuenta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.infoCuenta
    );

    router.post('/adminCuentasBajoPedido/subirDatosBajoPedido',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.subirDatosBajoPedido
    );

    router.post('/adminCuentasBajoPedido/editarDatosBajoPedido',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.editarDatosBajoPedido
    );

    router.post('/adminCuentasBajoPedido/eliminarCuentaBajoPedido',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.eliminarCuentaBajoPedido
    );

    // Administracion renovaciones

    router.get('/dashboard/adminCuentasRenovaciones',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.adminCuentasRenovaciones
    );

    router.post('/adminCuentasRenovaciones/infoCuenta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.infoCuenta
    );

    router.post('/adminCuentasRenovaciones/subirDatosRenovacion',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.subirDatosRenovacion
    );

    router.post('/adminCuentasRenovaciones/editarDatosRenovacion',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.editarDatosRenovacion
    );

    router.post('/adminCuentasRenovaciones/eliminarCuentaRenovacion',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.eliminarCuentaRenovacion
    );

    // Administracion personalizadas

    router.get('/dashboard/adminCuentasPersonalizadas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.adminCuentasPersonalizadas
    );

    router.post('/adminCuentasPersonalizadas/infoCuenta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.infoCuenta
    );

    router.post('/adminCuentasPersonalizadas/subirDatosPersonalizada',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.subirDatosPersonalizada
    );

    router.post('/adminCuentasPersonalizadas/editarDatosPersonalizada',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.editarDatosPersonalizada
    );

    router.post('/adminCuentasPersonalizadas/eliminarCuentaPersonalizada',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.eliminarCuentaPersonalizada
    );

    // Administracion Juegos

    router.get('/dashboard/adminCuentasJuegos',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.adminCuentasJuegos
    );

    router.post('/adminCuentasJuegos/infoCuenta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.infoCuenta
    );

    router.post('/adminCuentasJuegos/subirDatosJuego',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.uploadComprobante,
        cuentasController.subirDatosJuego
    );

    router.post('/adminCuentasJuegos/eliminarCuentaJuego',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        cuentasController.eliminarCuentaJuego
    );

    // Tabla ganancias

    router.get('/dashboard/ganancias',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        gananciasController.ganancias
    );

    // Reportes

    router.get('/dashboard/adminReporteCargas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        reportesController.adminReporteCargas
    );

    router.post('/adminReporteCargas/reporteCargasSuperdistribuidor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        reportesController.reporteCargasSuperdistribuidor
    );

    router.post('/adminReporteCargas/eliminarArchivo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        reportesController.eliminarArchivo
    );

    router.post('/adminConsignaciones/reporteConsignaciones',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        reportesController.reporteConsignaciones
    );

    router.post('/adminConsignaciones/eliminarArchivo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        reportesController.eliminarArchivo
    );

    router.post('/adminCuentasVendidas/reporteCuentasSuperdistribuidor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        reportesController.reporteCuentasSuperdistribuidor
    );

    router.post('/adminCuentasVendidas/eliminarArchivo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        reportesController.eliminarArchivo
    );

    router.post('/ganancias/reporteGanancias',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        reportesController.reporteGanancias
    );

    router.post('/ganancias/eliminarArchivo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        reportesController.eliminarArchivo
    );

    // Administrar Links PSE

    router.get('/dashboard/adminLinksPse',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        linkPseController.adminLinksPse
    );

    router.post('/adminLinksPse/asignarLink',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        linkPseController.asignarLink
    );

    router.post('/adminLinksPse/editarLink',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        linkPseController.editarLink
    );

    router.post('/adminLinksPse/eliminarLink',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        linkPseController.eliminarLink
    );

    // Administrar consignaciones

    router.get('/dashboard/adminConsignaciones',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        consignacionesController.adminConsignaciones
    );

    router.post('/adminConsignaciones/aprobarConsignacion',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        consignacionesController.aprobarConsignacion
    );

    router.post('/adminConsignaciones/rechazarConsignacion',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        consignacionesController.rechazarConsignacion
    ); 

    // Admin insidencias

    router.get('/dashboard/adminInsidencias',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        insidenciasController.adminInsidencias
    );

    router.post('/adminInsidencias/infoInsidencia',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        insidenciasController.infoInsidencia
    );

    router.post('/adminInsidencias/insidenciasSuperdistribuidor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        insidenciasController.insidenciasSuperdistribuidor
    );
    
    router.post('/adminInsidencias/sinResponderSuperdistribuidor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        insidenciasController.sinResponderSuperdistribuidor
    );

    router.post('/adminInsidencias/respondidasSuperdistribuidor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        insidenciasController.respondidasSuperdistribuidor
    );

    router.post('/adminInsidencias/responderInsidencia',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        insidenciasController.responderInsidencia
    );

    // Admin Preguntas Frecuentes

    router.get('/dashboard/adminFaq',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        preguntasController.adminFaq
    );

    router.post('/adminFaq/subirPregunta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        preguntasController.subirPregunta
    );

    router.post('/adminFaq/editarPregunta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        preguntasController.editarPregunta
    );

    router.post('/adminFaq/eliminarPregunta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        preguntasController.eliminarPregunta
    );

    // Subir pautas

    router.get('/dashboard/adminPublicidad',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        publicidadController.adminPublicidad
    );

    router.post('/adminPublicidad/subirPauta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        publicidadController.uploadPauta,
        publicidadController.subirPauta
    );

    router.post('/adminPublicidad/eliminarPauta',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaSuperdistribuidor,
        publicidadController.eliminarPauta
    );

    // =======================
    //    Paginas Usuarios
    // =======================

    // Administrador Usuarios (Admin)
    router.get('/dashboard/usuarios',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        usuariosController.usuarios
    );

    router.post('/usuarios/informacionPlataformasUsuario',
        usuariosController.usuariosInformacionPlataformasUsuario
    )

    router.post('/usuarios/cambioPefil',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        usuariosController.cambioPerfil
    );

    router.post('/usuarios/bloqueoUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        usuariosController.bloqueoUsuario
    );

    router.post('/usuarios/editarUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        usuariosController.editarUsuario
    );

    router.post('/usuarios/eliminarUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        usuariosController.eliminarUsuario
    );

    router.post('/usuarios/cargarSaldo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        usuariosController.cargarSaldoUsuario
    );


    router.post('/usuarios/restarSaldo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        usuariosController.restarSaldoUsuario
    );

    router.post('/usuarios/tablaAsignarPlataformas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        usuariosController.tablaAsignarPlataformas
    );

    router.post('/usuarios/asignarPlataformas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        usuariosController.asignarPlataformaUsuario
    );

    router.get('/dashboard/gananciasRed',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        gananciasController.gananciasRed
    );

    router.get('/dashboard/asignacionPlataformas/:id', 
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        usuariosController.asignacionesUsuario
    )

    // Compra plataformas (Distribuidores y resellers)
    router.get('/dashboard/plataformas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        comprarPlataformasController.plataformas
    );

    router.post('/plataformas/compraCuentaNormal',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        comprarPlataformasController.compraCuentaNormal
    );

    router.post('/plataformas/compraCuentaPedido',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        comprarPlataformasController.compraCuentaPedido
    );

    router.post('/plataformas/compraCuentaRenovacion',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        comprarPlataformasController.compraCuentaRenovacion
    );

    router.post('/plataformas/compraCuentaPersonalizada',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        comprarPlataformasController.compraCuentaPersonalizada
    );

    router.post('/plataformas/compraCuentaFreefire',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        comprarPlataformasController.compraCuentaFreefire
    );

    router.post('/plataformas/compraCuentaCallofduty',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        comprarPlataformasController.compraCuentaCallofduty
    );

    // Reportar consignaciones
    router.get('/dashboard/reportarConsignacion',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        consignacionesController.reportarConsignacion
    );

    router.post('/reportarConsignacion/subirConsignacion',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        consignacionesController.uploadComprobante,
        consignacionesController.subirConsignacion
    );

    router.post('/reportarConsignacion/infoMedio',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        mediosController.infoMedio
    );

    // Links PSE
    router.get('/dashboard/linkPse',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        linkPseController.linkPse
    );

    router.post('/linkPse/solicitarLink',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        linkPseController.solicitarLink
    );

    // Insidencias
    router.get('/dashboard/reportarInsidencia',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        insidenciasController.reportarInsidencia
    );

    router.post('/reportarInsidencia/crearInsidencia',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        insidenciasController.uploadArchivo,
        insidenciasController.crearInsidencia
    );

    router.post('/reportarInsidencia/infoInsidencia',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        insidenciasController.infoInsidencia
    );

    router.post('/reportarInsidencia/insidencias',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        insidenciasController.insidencias
    );
    
    router.post('/reportarInsidencia/sinResponder',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        insidenciasController.uploadArchivo,
        insidenciasController.sinResponder
    );

    router.post('/reportarInsidencia/respondidas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        insidenciasController.respondidas
    );

    // Administración de cuentas

    router.get('/dashboard/cuentasVendidas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        cuentasController.cuentasVendidas
    );

    router.get('/dashboard/cuentasBajoPedido',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        cuentasController.cuentasBajoPedido
    );

    router.get('/dashboard/cuentasRenovaciones',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        cuentasController.cuentasRenovaciones
    );

    router.get('/dashboard/cuentasPersonalizadas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        cuentasController.cuentasPersonalizadas
    );

    router.get('/dashboard/cuentasJuegos',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        cuentasController.cuentasJuegos
    );

    router.get('/dashboard/tablaPrecios',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        usuariosController.tablaPrecios
    );

    router.get('/dashboard/faq',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        preguntasController.faq
    );

    // Repotes

    router.get('/dashboard/reporteCompras',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.reporteCompras
    );

    router.post('/reporteCompras/reporteComprasSaldo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.reporteComprasSaldo
    );

    router.post('/reporteCompras/eliminarArchivo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.eliminarArchivo
    );

    router.get('/dashboard/reporteVentas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.reporteVentas
    );

    router.post('/reporteVentas/reporteVentasSaldo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.reporteVentasSaldo
    );

    router.post('/reporteVentas/eliminarArchivo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.eliminarArchivo
    );

    router.post('/cuentasVendidas/reporteCuentas',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.reporteCuentas
    );

    router.post('/cuentasVendidas/eliminarArchivo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.eliminarArchivo
    );

    router.post('/reportarConsignacion/reporteConsignacionesUser',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.reporteConsignacionesUser
    );

    router.post('/reportarConsignacion/eliminarArchivo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.eliminarArchivo
    );

    // reporte ganancias distribuidor
    router.post('/gananciasRed/reporteConsignacionesDistribuidor',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaDistribuidor,
        reportesController.reporteConsignacionesDistribuidor
    );

    router.post('/gananciasRed/eliminarArchivo',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaUsuario,
        reportesController.eliminarArchivo
    );

    // =================
    // Accesos generales
    // =================

    // Notificaciones usuario
    router.post('/notificaciones/notificacionesUsuario',
        authController.usuarioAutenticado,
        authController.verifyToken,
        rolController.permisosPaginaGeneral,
        notificacionesController.notificacionesUsuario
    );

    return router;
}
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/usuariosModelo');

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {

        // Codigo se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne({ where: {email: email, verificacion: 1}});
        
        // Revisar si existe el usuario
        if(!usuario) return done(null, false, {
            message: 'Usuario no registrado ó sin verificación de Email'
        });

        // Si el usuario ExclusionConstraintError, compara el password
        const verificarPass = usuario.validarPassword(password);
        // si el password es incorrecto
        if(!verificarPass) return done(null, false, {
            message: 'La constraseña es incorrecta'
        });

        // Todo bien
        return done(null, usuario);
    }
))

passport.serializeUser(function(usuario, done) {
    done(null, usuario);
});
passport.deserializeUser(function(usuario, done) {
    done(null, usuario);
});

module.exports = passport;
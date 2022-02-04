const express = require('express');
const router = express.Router();

// importar controladores
const generalController = require('../controllers/generalController');

module.exports = function () {
    router.get('/', generalController.home);
    router.get('/inicio', generalController.inicio);
    router.get('/nosotros', generalController.nosotros);
    router.get('/desarrollo', generalController.desarrollo);
    router.get('/contacto', generalController.contacto);
    router.get('/design', generalController.design);

    return router;
};

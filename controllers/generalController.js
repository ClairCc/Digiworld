exports.inicio = (req, res) => {
    res.render('inicio', {
        nombrePagina: 'Inicio',
    });
};
exports.home = (req, res) => {
    res.render('home', {
        nombrePagina: 'home',
    });
};

exports.nosotros = (req, res) => {
    res.render('nosotros', {
        nombrePagina: 'Nosotros',
    });
};

exports.desarrollo = (req, res) => {
    res.render('desarrollo', {
        nombrePagina: 'desarrollo',
    });
};
exports.contacto = (req, res) => {
    res.render('contacto', {
        nombrePagina: 'contacto',
    });
};
exports.design = (req, res) => {
    res.render('design', {
        nombrePagina: 'design',
    });
};

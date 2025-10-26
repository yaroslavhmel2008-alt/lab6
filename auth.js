const isAdmin = (req, res, next) => {
    // Перевірка фіксації входу в req.session
    if (req.session.isAuthenticated && req.session.isAdmin) {
        next(); // Користувач авторизований
    } else {
        // Перенаправлення на сторінку логіну
        res.redirect('/admin/login'); 
    }
};

module.exports = isAdmin;

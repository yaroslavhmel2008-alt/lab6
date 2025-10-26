const express = require('express');
const router = express.Router(); 
const Response = require('./response'); 
const isAdmin = require('./auth');     
require('dotenv').config();

// 1. GET /admin/login (Відображення форми логіну)
router.get('/login', (req, res) => {
    res.render('login', { error: null }); 
});

// 2. POST /admin/login (Обробка логіну та фіксація сесії)
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        // Фіксація входу в req.session
        req.session.isAuthenticated = true;
        req.session.isAdmin = true; 
        res.redirect('/admin');
    } else {
        res.render('login', { error: 'Невірний логін або пароль.' });
    }
});

// 3. GET /admin (ЗАХИЩЕНА СТОРІНКА: Відображення відповідей)
router.get('/', isAdmin, async (req, res) => {
    try {
        const responses = await Response.find().sort({ submitted_at: -1 });
        res.render('admin', { responses });
    } catch (err) {
        console.error('Помилка завантаження відповідей:', err);
        res.status(500).send('Помилка завантаження даних адмін-панелі.');
    }
});

// 4. GET /admin/logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => { 
        if (err) console.log(err);
        res.redirect('/admin/login');
    });
});

// 5. POST /admin/delete/:id (Видалення)
router.post('/delete/:id', isAdmin, async (req, res) => {
    try {
        await Response.findByIdAndDelete(req.params.id);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send('Помилка видалення.');
    }
});

// 6. GET /admin/export (Експорт)
router.get('/export', isAdmin, async (req, res) => {
    try {
        const responses = await Response.find().lean();
        
        let csv = "ID,Ім'я,Email,Дисципліна,Мови,Повідомлення,Дата\n";
        responses.forEach(resp => {
            const languages = resp.programming_language ? resp.programming_language.join('; ') : '';
            csv += `"${resp._id}","${resp.name}","${resp.email}","${resp.subject}","${languages}","${resp.message.replace(/"/g, '""')}",${resp.submitted_at}\n`;
        });
        
        res.header('Content-Type', 'text/csv');
        res.attachment('survey_responses.csv');
        res.send(csv);
    } catch (err) {
        res.status(500).send('Помилка експорту.');
    }
});

module.exports = router;

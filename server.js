const express = require('express');
const session = require('express-session'); 
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// --- Module Imports ---
const adminRoutes = require('./admin'); 
const connectDB = require('./db');
const Response = require('./response'); 
const PORT = 3000;

connectDB(); 

const app = express();

// --- Express Setup and Middleware ---
app.set('view engine', 'ejs');
app.set('views', 'views'); 
app.use(express.urlencoded({extended: true}));

// Налаштування сесій (ОБОВ'ЯЗКОВО для роботи авторизації)
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_very_strong_default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// --- Маршрути Анкети (Фронтенд) ---

app.get('/', (req, res) => {
    res.render('index', { message: null }); 
});

app.post('/survey', async (req, res) => {
    try {
        const formData = req.body;

        // --- 1. ЗБЕРЕЖЕННЯ В MONGODB ---
        const newResponse = new Response({
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            programming_language: Array.isArray(formData.programming_language) 
                                ? formData.programming_language 
                                : (formData.programming_language ? [formData.programming_language] : []),
            message: formData.message
        });

        await newResponse.save();
        console.log('Дані успішно збережено у MongoDB.');

        // --- 2. ЗБЕРЕЖЕННЯ У ЛОКАЛЬНИЙ ФАЙЛ ---
        
        const languages = Array.isArray(formData.programming_language) 
            ? formData.programming_language.join(', ') 
            : formData.programming_language || 'Не обрано';

        const dataToSave = `
--- Нова відповідь ---
Ім'я: ${formData.name}
Email: ${formData.email}
Улюблена дисципліна: ${formData.subject}
Улюблена мова: ${languages}
Повідомлення: ${formData.message || 'Немає'}
Час отримання: ${new Date().toISOString()}
----------------------
`;
        
        const timeStamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '_');
        const fileName = `анкета_відповідь_${timeStamp}.txt`;

        const responsesDir = path.join(__dirname, 'responses');
        const filePath = path.join(responsesDir, fileName);
        
        if (!fs.existsSync(responsesDir)) {
            fs.mkdirSync(responsesDir);
        }

        fs.writeFile(filePath, dataToSave, (err) => {
            if (err) {
                console.error('Помилка при збереженні локального файлу:', err);
            } else {
                console.log(`Локальний файл успішно збережено: ${fileName}`);
            }
        });

        res.render('index', { message: 'Дякую! Ваша відповідь збережена (у БД та локально).' });

    } catch (err) {
        console.error('Помилка при збереженні даних:', err);
        res.render('index', { message: 'Помилка сервера при збереженні даних.' });
    }
});

// --- Маршрути Адміністратора ---
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});

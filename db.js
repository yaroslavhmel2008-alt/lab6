const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Використовуємо MONGO_URI з файлу .env
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB успішно підключено.');
    } catch (err) {
        console.error('Помилка підключення до MongoDB:', err.message);
        process.exit(1); 
    }
};

module.exports = connectDB; // Експортуємо функцію підключення

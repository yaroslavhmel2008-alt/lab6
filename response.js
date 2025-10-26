const mongoose = require('mongoose');

// Визначаємо схему, яка описує, як повинні виглядати дані анкети.
const ResponseSchema = new mongoose.Schema({
    // Обов'язкові текстові поля
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true }, // Для радіо-кнопок

    // Масив рядків для чекбоксів (можна вибрати кілька мов)
    programming_language: { type: [String] }, 

    // Додаткове текстове поле
    message: { type: String },

    // Автоматична мітка часу, коли відповідь була збережена
    submitted_at: { type: Date, default: Date.now } 
});

// Створюємо та експортуємо Модель, яку Express використовуватиме для запису/читання з колекції 'responses'
module.exports = mongoose.model('Response', ResponseSchema);

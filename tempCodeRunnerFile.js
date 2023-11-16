// Подключение необходимых модулей
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config(); // Подключение файла .env для окружающих переменных
const Word = require('./models/word'); // Подключение модели слова

const app = express(); // Создание экземпляра приложения Express

// Разрешение CORS (Cross-Origin Resource Sharing) - разрешение доступа к ресурсам с разных доменов
app.use(cors());

// Указание директории для статических файлов
app.use(express.static(path.join(__dirname, 'Server Vocabulary Test')));

// Подключение парсера JSON для обработки тела запросов
app.use(bodyParser.json());

// Подключение к MongoDB с использованием окружающей переменной MONGO_URL из файла .env
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Обработка GET-запроса для получения списка слов
app.get('/words', async (req, res) => {
    try {
        const words = await Word.find(); // Извлечение всех слов из базы данных
        res.json(words); // Отправка списка слов в формате JSON
    } catch (error) {
        res.status(500).json({ message: 'Server error' }); // Обработка ошибок сервера
    }
});

// Обработка POST-запроса для добавления нового слова
app.post('/add-word', async (req, res) => {
    try {
        const newWord = new Word({
            english: req.body.english, // Извлечение английского слова из тела запроса
            russian: req.body.russian, // Извлечение русского слова из тела запроса
            transcription: req.body.transcription  
        });
        console.log('New Word Data:', newWord); // Выводим данные нового слова в консоль
        
        await newWord.save(); // Сохранение нового слова в базе данных
        res.json({ success: true }); // Отправка успешного ответа в формате JSON
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' }); // Обработка ошибок сервера
    }
});

// Запуск сервера на указанном порту из окружающей переменной PORT
app.listen(process.env.PORT, () => {
    console.log(`Сервер запущен на порту ${process.env.PORT}`);
});

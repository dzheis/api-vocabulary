const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const Word = require('./models/word');


const app = express();

// Разрешить доступ всем доменам
app.use(cors());

app.use(express.static(path.join(__dirname, 'Server Vocabulary Test')));
// Подключаем body-parser
app.use(bodyParser.json());

// Подключаемся к MongoDB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
app.get('/words', async (req, res) => {
    try {
        const words = await Word.find();
        res.json(words);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Обрабатываем POST-запрос для добавления слова
app.post('/add-word', async (req, res) => {
    try {
        const newWord = new Word({
            english: req.body.english,
            russian: req.body.russian
        });
        await newWord.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Запускаем сервер на порту 3000
app.listen(process.env.PORT, () => {
    console.log(`Сервер запущен на порту ${process.env.PORT}`);
});

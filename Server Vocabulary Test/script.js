"use strict";

// Получение элементов интерфейса
const forwardBtn = document.getElementById('forwardBtn');
const backBtn = document.getElementById('backBtn');
const randomBtn = document.getElementById('randomBtn');
const toggleButton = document.getElementById('toggleButton');
const englishWord = document.getElementById('englishWordClick');
const russianWord = document.getElementById('russianWordClick');
const searchWordInput = document.getElementById('searchWordInput');
const searchWordButton = document.getElementById('searchWordButton');
const addSearchedWordButton = document.getElementById('addSearchedWordButton');

const apiUrl = 'http://localhost:3000';  

// 'https://vocabulary-e561acf67931.herokuapp.com';

let vocabulary = {};
let currentIndex = 0;
let previousIndex = null;
let searchedWordData = null;

// Функция для определения языка слова
function getTranslationLanguage(word) {
    if (/[\u0400-\u04FF]/.test(word)) {
        return 'ru-en'; // Направление перевода с русского на английский
    } else {
        return 'en-ru'; // Направление перевода с английского на русский
    }
}

// Загрузка слов из сервера
function fetchWordsFromServer() {
    fetch(`http://localhost:3000/words`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Сетевой ответ не ok');
            }
            return response.json();
        })
        .then(data => {
            vocabulary = {};
            data.forEach(word => {
                vocabulary[word.english] = {
                    russian: word.russian,
                    transcription: word.transcription
                }
                console.log();
            });
            if (Object.keys(vocabulary).length > 0) {
                showWord(currentIndex);
            } else {
                console.error("Ошибка при загрузке слов: Сервер не вернул данные");
            }
        })
        .catch(error => {
            console.error("Ошибка при загрузке слов:", error);
        });
}
fetchWordsFromServer();

// Функция для отображения слова на экране
function showWord(index) {
    let englishWords = Object.keys(vocabulary);
    let wordKey = englishWords[index];
    let word = vocabulary[wordKey];

    if (!word) {
        console.error(`Слово с ключом "${wordKey}" не найдено в словаре.`);
        return;
    }
    
    // Получение транскрипции из базы данных или внешнего API
    const transcription = word.transcription || 'Нет транскрипции';
    
    englishWord.textContent = wordKey;
    russianWord.textContent = word.russian;
    document.getElementById('transcription').textContent = searchedWordData ? searchedWordData.transcription : transcription;
}


// Обработчики событий для кнопок навигации
randomBtn.addEventListener('click', function () {
    previousIndex = currentIndex;
    let englishWords = Object.keys(vocabulary);
    let randomIndex = Math.floor(Math.random() * englishWords.length);
    currentIndex = randomIndex;
    showWord(currentIndex);
});

backBtn.addEventListener('click', function () {
    if (previousIndex !== null) {
        currentIndex = previousIndex;
        showWord(currentIndex);
    }
});

forwardBtn.addEventListener('click', function () {
    let englishWords = Object.keys(vocabulary);
    currentIndex = (currentIndex + 1) % englishWords.length;
    showWord(currentIndex);
});

toggleButton.addEventListener('click', function () {
    russianWord.classList.toggle('visible');
    russianWord.classList.toggle('hidden');
    toggleButton.innerText = russianWord.classList.contains('visible') ? "Скрыть перевод" : "Показать перевод";
});

// Обработчик поиска слова в Yandex
searchWordButton.addEventListener('click', function () {
    const wordToSearch = searchWordInput.value.trim();
    if (!wordToSearch) {
        alert('Пожалуйста, введите слово для поиска');
        return;
    }

    const translationDirection = getTranslationLanguage(wordToSearch);

    fetch(`https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20231112T183924Z.d0433efb3942c6ed.a9f789cb257dbe73aed3b64b45e24cb94a0ecd7c&lang=${translationDirection}&text=${wordToSearch}`)
        .then(response => response.json())
        .then(data => {
            if (data.def && data.def.length > 0) {
                const wordInfo = data.def[0];
                const translation = wordInfo.tr.map(tr => tr.text).join(', ');
                const transcription = wordInfo.ts || 'Нет транскрипции';

                searchedWordData = {
                    [translationDirection.startsWith('en') ? 'english' : 'russian']: wordToSearch,
                    [translationDirection.startsWith('en') ? 'russian' : 'english']: translation,
                    transcription: transcription
                };
                console.log(searchedWordData);
                alert(`${wordToSearch} - ${translation} (${transcription})`);
            } else {
                alert('Слово не найдено');
                searchedWordData = null;
            }
        })
        .catch(error => {
            console.error('Ошибка при запросе:', error);
            searchedWordData = null;
        });
});

// Обработчик POST-запроса для добавления нового слова в базу данных
addSearchedWordButton.addEventListener('click', function () {
    if (searchedWordData) {
        fetch(`${apiUrl}/add-word`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                english: searchedWordData.english,
                russian: searchedWordData.russian,
                transcription: searchedWordData.transcription || ''
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Слово успешно добавлено в базу данных');
                    fetchWordsFromServer(); // Обновляем список слов
                } else {
                    alert('Ошибка при добавлении слова в базу данных');
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    } else {
        alert('Нет данных для добавления');
    }
});

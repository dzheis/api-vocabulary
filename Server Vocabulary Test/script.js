"use strict";
//TODO: Переделать транскрипцию, при обратном переводе не отображается - возможно прийдётся сменить API, яндекс не даёт транскрипцию английского слова при поиске через русское
//TODO: Переделать модальное окно с bootstrap на tailwindcss
//TODO: Заменить все Алерты на кастомные модальные окна
//TODO: Додавить responsive для модальных окон
//TODO: Добавить проверку на существование слова в БД, выводить модальное окно с предупреждением, что слово уже есть в Словарике
//TODO: Провести рефакторинг всего кода перед финальным деплоем

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
    document.getElementById('transcription').innerHTML = `[${word.transcription}] 
                <div id="svgContainer" class="inline-block mr-2 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-5 h-4 sm:w-7 sm:h-7">
                        <path stroke-linecap="round" stroke-linejoin="round"
                         d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                </div>`

    const apiKey = 'dfbb085b-0663-4088-8173-cc21ce0574da';

    fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${wordKey}?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0 && data[0].hwi && data[0].hwi.prs && data[0].hwi.prs[0] && data[0].hwi.prs[0].sound && data[0].hwi.prs[0].sound.audio) {
                const audioFile = data[0].hwi.prs[0].sound.audio;
                const audioUrl = `https://media.merriam-webster.com/soundc11/${audioFile[0]}/${audioFile}.wav`;

                document.getElementById('svgContainer').addEventListener('click', function () {
                    const audio = new Audio(audioUrl);
                    audio.play();
                });
            } else {
                console.error('Аудио не найдено для слова:', wordKey);
                //TODO: выводить тут модальное окно, если 
            }
        })
        .catch(error => {
            console.error('Ошибка при запросе аудио:', error);
            //TODO: выводить тут модальное окно, если 
        });
}

// Обработчик нажатия клавиши Enter для поиска слова
searchWordInput.addEventListener('keypress', function (event) {
    // Код клавиши Enter
    const enterKeyCode = 13;

    // Проверяем, была ли нажата клавиша Enter
    if (event.keyCode === enterKeyCode) {
        // Вызываем функцию поиска слова
        searchWordFunction();
    }
});

// Функция для поиска слова в Yandex
function searchWordFunction() {
    const wordToSearch = searchWordInput.value.trim().toLowerCase();
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

                document.getElementById('searchResult').innerText = `${wordToSearch} - ${translation} [${transcription}]`;
                // Открываем модальное окно
                $('#searchModal').modal('show');
            } else {
                alert('Слово не найдено');
                searchedWordData = null;
            }
        })
        .catch(error => {
            console.error('Ошибка при запросе:', error);
            searchedWordData = null;
        })
        .finally(() => {
            // Очистка input после выполнения поиска
            searchWordInput.value = '';
        });
};

// Обработчик POST-запроса для добавления нового слова в базу данных
addSearchedWordButton.addEventListener('click', function () {
    if (searchedWordData) {
        fetch(`${apiUrl}/add-word`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                english: searchedWordData.english.toLowerCase(),
                russian: searchedWordData.russian.toLowerCase(),
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

fetchWordsFromServer();

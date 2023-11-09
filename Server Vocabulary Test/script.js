"Use strict"

const buttonContainer = document.getElementById('buttonContainer');
const forwardBtn = document.getElementById('forwardBtn');
const backBtn = document.getElementById('backBtn');
const randomBtn = document.getElementById('randomBtn');
const toggleButton = document.getElementById('toggleButton');
const toggleRu = document.getElementById('toggleRu');
const englishWord = document.getElementById('englishWordClick');
const russianWord = document.getElementById('russianWordClick');

const apiUrl = 'https://vocabulary-980c1232d2cb.herokuapp.com';
let vocabulary = {}

let currenIndex = 0;
let previousIndex = null;
let showInputs = false;

function showWord(index) {
    let englishWords = Object.keys(vocabulary);
    let wordKey = englishWords[index];
    let word = vocabulary[wordKey];
    englishWord.textContent = wordKey;
    russianWord.textContent = word;
};
function fetchWordsFromServer() {
    fetch(`${apiUrl}/words`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Cетевой ответ не ok');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(word => {
                vocabulary[word.english] = word.russian;
            });
            // После загрузки слов вы можете, например, обновить отображение на странице
            showWord(currenIndex);

        })
        .catch(error => {
            console.error("Ошибка при загрузке слов:", error)
            alert(`Ошибка: ${error}`)
        });
}
fetchWordsFromServer();

randomBtn.addEventListener('click', function () {
    previousIndex = currenIndex;
    let englishWords = Object.keys(vocabulary);
    let randomIndex = Math.floor(Math.random() * englishWords.length);
    currenIndex = randomIndex;
    showWord(currenIndex);

});
backBtn.addEventListener('click', function () {
    let temp = currenIndex;
    currenIndex = previousIndex;
    previousIndex = temp;
    showWord(currenIndex);
});
forwardBtn.addEventListener('click', function () {
    let englishWords = Object.keys(vocabulary);
    if (currenIndex === englishWords.length - 1) {
        currenIndex = 0;
    } else {
        currenIndex++;
    }
    showWord(currenIndex);
});
toggleButton.addEventListener('click', function () {
    if (russianWord.classList.contains('visible')) {
        russianWord.classList.remove('visible');
        russianWord.classList.add('hidden');
        toggleButton.innerText = "Показать перевод"
    } else {
        russianWord.classList.remove('hidden');
        russianWord.classList.add('visible');
        toggleButton.innerText = "Скрыть перевод"
    }
});
function toggleInputs() {
    showInputs = !showInputs;
    if (showInputs) {
        document.querySelector(".inputContainer").classList.contains('nonVisible');
        document.querySelector(".inputContainer").classList.remove('nonVisible');
        document.querySelector(".inputContainer").classList.add('visible');
        document.querySelector("#toggleButtonInput").textContent = 'Скрыть поля ввода';
    } else {
        document.querySelector(".inputContainer").classList.contains('visible');
        document.querySelector(".inputContainer").classList.remove('visible');
        document.querySelector(".inputContainer").classList.add('nonVisible');
        document.querySelector("#toggleButtonInput").textContent = 'Показать поля ввода';
    }
};
document.getElementById('wordForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Отменяем стандартное поведение формы

    // Получаем значения из полей ввода
    const englishWord = document.getElementById('englishWord').value.trim(); // используем trim() для удаления лишних пробелов
    const russianWord = document.getElementById('russianWord').value.trim();

    // Проверка, что поля не пустые
    if (!englishWord || !russianWord) {
        // Если хотя бы одно поле пустое, показываем ошибку
        alert('Пожалуйста, введите слово правильно!');
        return; // прерываем функцию, чтобы не отправлять запрос на сервер
    }

    // Если проверка прошла успешно, продолжаем отправку данных на сервер
    fetch(`${apiUrl}/add-word`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            english: englishWord,
            russian: russianWord
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Слово успешно добавлено!');
            fetchWordsFromServer(); // Это должна быть ваша функция для обновления списка слов на странице
            document.getElementById('wordForm').reset(); // Сброс формы
        } else {
            alert('Произошла ошибка при добавлении слова.');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });
});

showWord(currenIndex);





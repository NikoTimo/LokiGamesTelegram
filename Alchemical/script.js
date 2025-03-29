document.addEventListener('DOMContentLoaded', () => {
    const attemptsDiv = document.querySelector('.attempts');
    const currentAttemptDiv = document.querySelector('.current-attempt');
    const availableSymbolsDiv = document.querySelector('.available-symbols');
    const submitButton = document.getElementById('submit-button');
    const clearButton = document.getElementById('clear-button');
    const attemptsLeftSpan = document.getElementById('attempts-left');
    const attemptsRemainingDisplay = document.getElementById('attempts-remaining-display');
    const rulesScreen = document.querySelector('.rules-screen');
    const gameArea = document.querySelector('.game-area');
    const startGameButton = document.getElementById('start-game-button');
    const winScreen = document.querySelector('.win-screen');
    const restartButton = document.getElementById('restart-button');

    const symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const colors = ['B', 'Y', 'R', 'G']; // Пример цветов
    let secretCode = generateSecretCode();
    let currentAttempt = [];
    let attemptsLeft = 5;
    let availableSymbols = [...symbols]; // Копия доступных символов

    // Функция для генерации случайного секретного кода (с уникальными символами)
    function generateSecretCode() {
        const shuffledSymbols = [...symbols].sort(() => 0.5 - Math.random());
        return shuffledSymbols.slice(0, 6);
    }

    // Функция для создания элемента символа с возможностью указания цвета
    function createSymbolElement(symbol, color = 'B') {
        const img = document.createElement('img');
        img.src = `assets/${color}${symbol}.png`;
        img.alt = symbol;
        img.classList.add('symbol-choice');
        img.dataset.symbol = symbol;
        return img;
    }

    // Функция для отображения доступных символов
    function displayAvailableSymbols() {
        availableSymbolsDiv.innerHTML = '';
        availableSymbols.forEach(symbol => {
            const symbolElement = createSymbolElement(symbol);
            availableSymbolsDiv.appendChild(symbolElement);
        });
    }

    // Функция для отображения текущей попытки
    function displayCurrentAttempt() {
        currentAttemptDiv.innerHTML = '';
        currentAttempt.forEach(symbol => {
            const cell = document.createElement('div');
            cell.classList.add('attempt-cell');
            const img = createSymbolElement(symbol);
            cell.appendChild(img);
            currentAttemptDiv.appendChild(cell);
        });
        for (let i = currentAttempt.length; i < 6; i++) {
            const cell = document.createElement('div');
            cell.classList.add('attempt-cell');
            currentAttemptDiv.appendChild(cell);
        }
        submitButton.disabled = currentAttempt.length !== 6;
    }

    // Функция для обработки выбора символа
    function handleSymbolSelect(event) {
        if (currentAttempt.length < 6) {
            const selectedSymbol = event.target.dataset.symbol;
            currentAttempt.push(selectedSymbol);
            displayCurrentAttempt();

            // Находим выбранный элемент и делаем его неактивным
            const selectedElement = Array.from(availableSymbolsDiv.children).find(el => el.dataset.symbol === selectedSymbol);
            if (selectedElement) {
                selectedElement.classList.add('selected'); // Добавляем класс для визуального отключения
                selectedElement.onclick = null; // Отключаем обработчик клика
                selectedElement.style.opacity = 0.5; // Делаем полупрозрачным
                selectedElement.style.cursor = 'default'; // Меняем курсор
            }
        }
    }

    // Функция для проверки попытки
    function checkAttempt() {
        if (currentAttempt.length !== 6) {
            return;
        }

        const checkResult = checkBullsAndCowsWithIndices(currentAttempt, secretCode);
        displayAttemptResult(currentAttempt, checkResult);
        attemptsLeft--;
        attemptsRemainingDisplay.textContent = `Осталось попыток: ${attemptsLeft}`;

        if (checkResult.bulls === 6) {
            endGame(true);
        } else if (attemptsLeft === 0) {
            endGame(false);
        }

        currentAttempt = [];
        displayCurrentAttempt();
        displayAvailableSymbols();
    }

    // Модифицированная функция для подсчета быков и коров и определения их индексов
    function checkBullsAndCowsWithIndices(attempt, secret) {
        let bulls = 0;
        let cows = 0;
        const bullsIndices = [];
        const cowsIndices = [];
        const secretCounts = {};
        const attemptCounts = {};

        // Сначала находим быков
        for (let i = 0; i < secret.length; i++) {
            if (attempt[i] === secret[i]) {
                bulls++;
                bullsIndices.push(i);
            }
        }

        // Затем находим коров (исключая быков)
        for (let i = 0; i < secret.length; i++) {
            if (attempt[i] !== secret[i]) {
                attemptCounts[attempt[i]] = (attemptCounts[attempt[i]] || 0) + 1;
            }
        }
        for (let i = 0; i < secret.length; i++) {
            if (attempt[i] !== secret[i]) {
                if (secretCounts[secret[i]]) {
                    cows++;
                    cowsIndices.push(i);
                    secretCounts[secret[i]]--;
                    if (secretCounts[secret[i]] === 0) {
                        delete secretCounts[secret[i]];
                    }
                } else {
                    secretCounts[secret[i]] = (secretCounts[secret[i]] || 0) + 1;
                }
            }
        }

        cows = 0;
        const secretRemaining = {};
        const attemptRemaining = {};

        for (let i = 0; i < secret.length; i++) {
            if (!bullsIndices.includes(i)) {
                secretRemaining[secret[i]] = (secretRemaining[secret[i]] || 0) + 1;
                attemptRemaining[attempt[i]] = (attemptRemaining[attempt[i]] || 0) + 1;
            }
        }

        for (const symbol in attemptRemaining) {
            if (secretRemaining[symbol]) {
                cows += Math.min(attemptRemaining[symbol], secretRemaining[symbol]);
            }
        }

        const actualCowsIndices = [];
        const usedSecretIndices = new Array(secret.length).fill(false);
        const usedAttemptIndices = new Array(currentAttempt.length).fill(false);

        for (let i = 0; i < currentAttempt.length; i++) {
            if (currentAttempt[i] === secretCode[i]) {
                usedSecretIndices[i] = true;
                usedAttemptIndices[i] = true;
            }
        }

        for (let i = 0; i < currentAttempt.length; i++) {
            if (!usedAttemptIndices[i]) {
                for (let j = 0; j < secretCode.length; j++) {
                    if (!usedSecretIndices[j] && currentAttempt[i] === secretCode[j]) {
                        actualCowsIndices.push(i);
                        usedSecretIndices[j] = true;
                        usedAttemptIndices[i] = true;
                        break;
                    }
                }
            }
        }

        return { bulls, cows, bullsIndices, cowsIndices: actualCowsIndices };
    }

    // Функция для отображения результата попытки (с изменением цвета символов)
    function displayAttemptResult(attempt, result) {
        const attemptDiv = document.createElement('div');
        attemptDiv.classList.add('attempt-result');
        const attemptSymbolsDiv = document.createElement('div');
        attemptSymbolsDiv.classList.add('attempt-symbols');

        attempt.forEach((symbol, index) => {
            let colorCode = 'R'; // По умолчанию красный (не в шифре)

            if (result.bullsIndices.includes(index)) {
                colorCode = 'G'; // Зеленый для быков
            } else if (result.cowsIndices.includes(index)) {
                colorCode = 'Y'; // Желтый для коров
            }

            const img = createSymbolElement(symbol, colorCode);
            attemptSymbolsDiv.appendChild(img);
        });

        attemptDiv.appendChild(attemptSymbolsDiv);
        attemptsDiv.prepend(attemptDiv);
    }

    // Функция для очистки текущей попытки
    function clearAttempt() {
        currentAttempt = [];
        Array.from(availableSymbolsDiv.children).forEach(el => {
            el.classList.remove('selected');
            el.onclick = handleSymbolSelect;
            el.style.opacity = 1;
            el.style.cursor = 'pointer';
        });
        displayCurrentAttempt();
    }

    // Функция для обработки клика по ячейке текущей попытки
    function handleCurrentAttemptCellClick(event) {
        const index = Array.from(currentAttemptDiv.children).indexOf(event.target);
        if (index >= 0 && index < currentAttempt.length) {
            const removedSymbol = currentAttempt.splice(index, 1)[0];
            const availableElement = Array.from(availableSymbolsDiv.children).find(el => el.dataset.symbol === removedSymbol);
            if (availableElement && availableElement.classList.contains('selected')) {
                availableElement.classList.remove('selected');
                availableElement.onclick = handleSymbolSelect;
                availableElement.style.opacity = 1;
                availableElement.style.cursor = 'pointer';
            }
            displayCurrentAttempt();
            displayAvailableSymbols();
        }
    }

    // Функция для завершения игры
    function endGame(isWin) {
        submitButton.disabled = true;
        clearButton.disabled = true;
        if (isWin) {
            gameArea.classList.add('hidden');
            winScreen.classList.remove('hidden');
        } else {
            let message = `Увы, попытки закончились. Секретный код был: ${secretCode.join('')}`;
            attemptsRemainingDisplay.textContent = `Игра окончена. ${message}`;
            alert(message); // Временное решение, лучше использовать модальное окно
        }
    }

    // Обработчик нажатия кнопки "Начать игру"
    startGameButton.addEventListener('click', () => {
        rulesScreen.classList.add('hidden');
        gameArea.classList.remove('hidden');
        winScreen.classList.add('hidden'); // Скрываем экран победы при начале новой игры
        secretCode = generateSecretCode(); // Генерируем код при начале игры
        attemptsLeft = 5;
        attemptsRemainingDisplay.textContent = `Осталось попыток: ${attemptsLeft}`;
        attemptsDiv.innerHTML = ''; // Очищаем предыдущие попытки
        clearAttempt();
    });

    // Обработчик нажатия кнопки "Новая игра" на экране победы
    restartButton.addEventListener('click', () => {
        gameArea.classList.remove('hidden');
        winScreen.classList.add('hidden');
        secretCode = generateSecretCode();
        attemptsLeft = 5;
        attemptsRemainingDisplay.textContent = `Осталось попыток: ${attemptsLeft}`;
        attemptsDiv.innerHTML = '';
        clearAttempt();
    });

    // Обработчики событий
    availableSymbolsDiv.addEventListener('click', (event) => {
        if (event.target.classList.contains('symbol-choice') && !event.target.classList.contains('selected')) {
            handleSymbolSelect(event);
        }
    });

    submitButton.addEventListener('click', checkAttempt);
    clearButton.addEventListener('click', clearAttempt);
    currentAttemptDiv.addEventListener('click', (event) => {
        if (event.target.classList.contains('attempt-cell') && event.target.firstChild) {
            handleCurrentAttemptCellClick(event);
        }
    });

    // Инициализация
    displayAvailableSymbols();
    displayCurrentAttempt();
    attemptsRemainingDisplay.textContent = `Осталось попыток: ${attemptsLeft}`;

    // Скрываем игровое поле и экран победы при загрузке
    gameArea.classList.add('hidden');
    winScreen.classList.add('hidden');
});
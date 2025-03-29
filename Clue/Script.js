document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');
    const openCardButton = document.getElementById('open-card-button');
    const nextCardCostDisplay = document.getElementById('next-card-cost');
    const accuseButton = document.getElementById('accuse-button');

    const accusationModal = document.getElementById('accusation-modal');
    const closeAccusationModalButton = accusationModal.querySelector('.close-button');
    const submitAccusationButton = document.getElementById('submit-accusation');
    const suspectSelect = document.getElementById('suspect');
    const weaponSelect = document.getElementById('weapon');
    const locationSelect = document.getElementById('location');
    const motiveSelect = document.getElementById('motive');

    const resultModal = document.getElementById('result-modal');
    const closeResultModalButton = resultModal.querySelector('.close-button');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const playAgainButton = document.getElementById('play-again-button');

    const suspects = ["Госпожа Пикок", "Профессор Плам", "Доктор Орхидея", "Полковник Мастард", "Мисс Скарлет"];
    const weapons = ["Револьвер", "Кинжал", "Верёвка", "Канделябр", "Яд"];
    const locations = ["Библиотека", "Гостиная", "Столовая", "Зимний сад", "Кухня"];
    const motives = ["Ревность", "Наследство", "Шантаж", "Долги", "Личная месть"];

    let crime;
    let cardsData;
    let score = 100;
    let openedCardsCount = 0;
    const initialOpenCards = 4;
    const maxOpenCards = 9;
    const cardOpenCosts = [5, 10, 15, 20, 25];

    function initializeGame() {
        crime = generateCrime();
        cardsData = generateCards(crime);
        score = 100;
        openedCardsCount = 0;
        scoreDisplay.textContent = score;
        nextCardCostDisplay.textContent = cardOpenCosts[openedCardsCount];
        gameBoard.innerHTML = '';
        renderGameBoard();
        updateOpenCardButtonState();
    }

    function generateCrime() {
        return {
            suspect: suspects[Math.floor(Math.random() * suspects.length)],
            weapon: weapons[Math.floor(Math.random() * weapons.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            motive: motives[Math.floor(Math.random() * motives.length)]
        };
    }

   function generateCards(crime) {
    const cards = [];
    const usedHints = new Set(); // Отслеживаем уже использованные комбинации, чтобы избежать дубликатов и противоречий

    // Функция для добавления карты, проверяющая уникальность
    function addCard(card) {
        const key = JSON.stringify(card);
        if (!usedHints.has(key)) {
            cards.push(card);
            usedHints.add(key);
        }
    }

    // Добавляем прямые подсказки
    addCard({ type: 'direct', category: 'suspect', value: crime.suspect, isOpened: cards.length < initialOpenCards });
    addCard({ type: 'direct', category: 'weapon', value: crime.weapon, isOpened: cards.length < initialOpenCards });
    addCard({ type: 'direct', category: 'location', value: crime.location, isOpened: cards.length < initialOpenCards });

    // Добавляем исключающие подсказки (гарантированно исключают неверные варианты)
    const otherSuspects = suspects.filter(s => s !== crime.suspect);
    const otherWeapons = weapons.filter(w => w !== crime.weapon);
    const otherLocations = locations.filter(l => l !== crime.location);
    const otherMotives = motives.filter(m => m !== crime.motive);

    addCard({ type: 'exclusion', category: 'suspect', value: otherSuspects[Math.floor(Math.random() * otherSuspects.length)], isOpened: cards.length < initialOpenCards });
    addCard({ type: 'exclusion', category: 'weapon', value: otherWeapons[Math.floor(Math.random() * otherWeapons.length)], isOpened: cards.length < initialOpenCards });
    addCard({ type: 'exclusion', category: 'location', value: otherLocations[Math.floor(Math.random() * otherLocations.length)], isOpened: cards.length < initialOpenCards });
    addCard({ type: 'exclusion', category: 'motive', value: otherMotives[Math.floor(Math.random() * otherMotives.length)], isOpened: cards.length < initialOpenCards });

    // Добавляем косвенные подсказки (связываем элементы, стараясь избегать явных противоречий)
    // Пример: Связываем верный элемент одной категории с неверным элементом другой
    addCard({ type: 'indirect', category1: 'suspect', value1: crime.suspect, category2: 'motive', value2: otherMotives[Math.floor(Math.random() * otherMotives.length)], isOpened: cards.length < initialOpenCards });
    addCard({ type: 'indirect', category1: 'weapon', value1: crime.weapon, category2: 'location', value2: otherLocations[Math.floor(Math.random() * otherLocations.length)], isOpened: cards.length < initialOpenCards });
    addCard({ type: 'indirect', category1: 'location', value1: crime.location, category2: 'suspect', value2: otherSuspects[Math.floor(Math.random() * otherSuspects.length)], isOpened: cards.length < initialOpenCards });
    addCard({ type: 'indirect', category1: 'motive', value1: crime.motive, category2: 'weapon', value2: otherWeapons[Math.floor(Math.random() * otherWeapons.length)], isOpened: cards.length < initialOpenCards });

    // Добавляем косвенные подсказки, связывающие два неверных элемента
    if (otherSuspects.length > 0 && otherWeapons.length > 0) {
        addCard({ type: 'indirect', category1: 'suspect', value1: otherSuspects[0], category2: 'weapon', value2: otherWeapons[0], isOpened: cards.length < initialOpenCards });
    }
    if (otherLocations.length > 0 && otherMotives.length > 0) {
        addCard({ type: 'indirect', category1: 'location', value1: otherLocations[0], category2: 'motive', value2: otherMotives[0], isOpened: cards.length < initialOpenCards });
    }
    if (otherWeapons.length > 1 && otherSuspects.length > 1) {
        addCard({ type: 'indirect', category1: 'weapon', value1: otherWeapons[1], category2: 'suspect', value2: otherSuspects[1], isOpened: cards.length < initialOpenCards });
    }
    if (otherMotives.length > 1 && otherLocations.length > 1) {
        addCard({ type: 'indirect', category1: 'motive', value1: otherMotives[1], category2: 'location', value2: otherLocations[1], isOpened: cards.length < initialOpenCards });
    }

    // Добавляем оставшиеся косвенные подсказки случайным образом, стараясь не дублировать
    while (cards.filter(card => card.type === 'indirect').length < 8 && allElements.length >= 2) {
        const cat1Index = Math.floor(Math.random() * 4);
        const cat2Index = Math.floor(Math.random() * 4);
        if (cat1Index === cat2Index) continue; // Избегаем связывания элемента с самим собой

        let val1, val2;
        let cat1, cat2;

        if (cat1Index === 0) { cat1 = 'suspect'; val1 = suspects[Math.floor(Math.random() * suspects.length)]; }
        if (cat1Index === 1) { cat1 = 'weapon'; val1 = weapons[Math.floor(Math.random() * weapons.length)]; }
        if (cat1Index === 2) { cat1 = 'location'; val1 = locations[Math.floor(Math.random() * locations.length)]; }
        if (cat1Index === 3) { cat1 = 'motive'; val1 = motives[Math.floor(Math.random() * motives.length)]; }

        if (cat2Index === 0) { cat2 = 'suspect'; val2 = suspects[Math.floor(Math.random() * suspects.length)]; }
        if (cat2Index === 1) { cat2 = 'weapon'; val2 = weapons[Math.floor(Math.random() * weapons.length)]; }
        if (cat2Index === 2) { cat2 = 'location'; val2 = locations[Math.floor(Math.random() * locations.length)]; }
        if (cat2Index === 3) { cat2 = 'motive'; val2 = motives[Math.floor(Math.random() * motives.length)]; }

        addCard({ type: 'indirect', category1: cat1, value1: val1, category2: cat2, value2: val2, isOpened: cards.length < initialOpenCards });
    }

    // Заполняем оставшиеся карты случайными исключающими или косвенными подсказками
    while (cards.length < 16) {
        const type = Math.random() < 0.5 ? 'exclusion' : 'indirect';
        if (type === 'exclusion') {
            const categoryIndex = Math.floor(Math.random() * 4);
            let category, value;
            if (categoryIndex === 0) { category = 'suspect'; value = suspects[Math.floor(Math.random() * suspects.length)]; }
            if (categoryIndex === 1) { category = 'weapon'; value = weapons[Math.floor(Math.random() * weapons.length)]; }
            if (categoryIndex === 2) { category = 'location'; value = locations[Math.floor(Math.random() * locations.length)]; }
            if (categoryIndex === 3) { category = 'motive'; value = motives[Math.floor(Math.random() * motives.length)]; }
            addCard({ type: 'exclusion', category: category, value: value, isOpened: cards.length < initialOpenCards });
        } else {
            const cat1Index = Math.floor(Math.random() * 4);
            const cat2Index = Math.floor(Math.random() * 4);
            if (cat1Index === cat2Index) continue;

            let val1, val2;
            let cat1, cat2;

            if (cat1Index === 0) { cat1 = 'suspect'; val1 = suspects[Math.floor(Math.random() * suspects.length)]; }
            if (cat1Index === 1) { cat1 = 'weapon'; val1 = weapons[Math.floor(Math.random() * weapons.length)]; }
            if (cat1Index === 2) { cat1 = 'location'; val1 = locations[Math.floor(Math.random() * locations.length)]; }
            if (cat1Index === 3) { cat1 = 'motive'; val1 = motives[Math.floor(Math.random() * motives.length)]; }

            if (cat2Index === 0) { cat2 = 'suspect'; val2 = suspects[Math.floor(Math.random() * suspects.length)]; }
            if (cat2Index === 1) { cat2 = 'weapon'; val2 = weapons[Math.floor(Math.random() * weapons.length)]; }
            if (cat2Index === 2) { cat2 = 'location'; val2 = locations[Math.floor(Math.random() * locations.length)]; }
            if (cat2Index === 3) { cat2 = 'motive'; val2 = motives[Math.floor(Math.random() * motives.length)]; }

            addCard({ type: 'indirect', category1: cat1, value1: val1, category2: cat2, value2: val2, isOpened: cards.length < initialOpenCards });
        }
    }

    return cards.sort(() => Math.random() - 0.5);
}

    function renderGameBoard() {
        gameBoard.innerHTML = '';
        cardsData.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.index = index;

            if (card.isOpened) {
                cardElement.classList.add('open');
                let content = '';
                if (card.type === 'direct') {
                    content = `✅ ${card.value}`;
                } else if (card.type === 'exclusion') {
                    content = `❌ ${card.value}`;
                } else if (card.type === 'indirect') {
                    content = `${card.value1} + ${card.value2}`;
                }
                cardElement.textContent = content;
            } else {
                cardElement.textContent = '?';
                cardElement.addEventListener('click', () => openCard(index));
            }
            gameBoard.appendChild(cardElement);
        });
    }

    function openCard(index) {
        if (!cardsData[index].isOpened && openedCardsCount < maxOpenCards) {
            const costIndex = openedCardsCount - initialOpenCards;
            const cost = costIndex >= 0 ? cardOpenCosts[costIndex] : 0;

            if (score >= cost) {
                score -= cost;
                scoreDisplay.textContent = score;
                cardsData[index].isOpened = true;
                openedCardsCount++;
                renderGameBoard();
                updateOpenCardButtonState();
                if (openedCardsCount - initialOpenCards < cardOpenCosts.length) {
                    nextCardCostDisplay.textContent = cardOpenCosts[openedCardsCount - initialOpenCards];
                } else {
                    nextCardCostDisplay.textContent = 'Макс.';
                }
            } else {
                alert('Недостаточно очков для открытия карты.');
            }
        }
    }

    function updateOpenCardButtonState() {
        if (openedCardsCount >= maxOpenCards) {
            openCardButton.disabled = true;
            openCardButton.textContent = 'Макс. карт открыто';
        } else {
            openCardButton.disabled = false;
            openCardButton.textContent = `Открыть карту (-${nextCardCostDisplay.textContent})`;
        }
    }

    accuseButton.addEventListener('click', () => {
        accusationModal.style.display = 'block';
    });

    closeAccusationModalButton.addEventListener('click', () => {
        accusationModal.style.display = 'none';
    });

    closeResultModalButton.addEventListener('click', () => {
        resultModal.style.display = 'none';
    });

    submitAccusationButton.addEventListener('click', () => {
        const selectedSuspect = suspectSelect.value;
        const selectedWeapon = weaponSelect.value;
        const selectedLocation = locationSelect.value;
        const selectedMotive = motiveSelect.value;

        accusationModal.style.display = 'none';

        if (
            selectedSuspect === crime.suspect &&
            selectedWeapon === crime.weapon &&
            selectedLocation === crime.location &&
            selectedMotive === crime.motive
        ) {
            resultTitle.textContent = 'Поздравляем!';
            resultMessage.textContent = `Вы раскрыли дело! Ваш финальный счет: ${score}`;
        } else {
            resultTitle.textContent = 'Неверное обвинение!';
            resultMessage.textContent = `К сожалению, ваше обвинение неверно. Попробуйте еще раз?`;
        }
        resultModal.style.display = 'block';
    });

    playAgainButton.addEventListener('click', () => {
        resultModal.style.display = 'none';
        initializeGame();
    });

    initializeGame();
});
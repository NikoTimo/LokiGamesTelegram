const gameContainer = document.getElementById('game-container');
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const levelDisplay = document.getElementById('level');

let score = 0;
let lives = 3;
let level = 1;
const spawnPoints = [10, 25, 50, 75, 90]; // Процентные позиции для спавна элементов
let basketIndex = 2; // Начальная позиция (центральный спот)

let gameInterval;

// Функция старта игры
function startGame() {
    document.getElementById("start-screen").style.display = "none";
    gameContainer.style.display = "block";
    gameInterval = setInterval(createItem, 1000);
}

// Функция создания падающих элементов
function createItem() {
    const item = document.createElement('div');
    item.classList.add('falling-item');

    const randomType = Math.random();
    if (randomType < 0.6) {
        item.style.backgroundImage = "url('sprites/coin.png')";
        item.dataset.type = "coin";
    } else if (randomType < 0.85) {
        item.style.backgroundImage = "url('sprites/diamond.png')";
        item.dataset.type = "diamond";
    } else if (randomType < 0.90) {
        item.style.backgroundImage = "url('sprites/heart.png')";
        item.dataset.type = "heart";
    } else {
        item.style.backgroundImage = "url('sprites/bomb.png')";
        item.dataset.type = "bomb";
    }

    const spawnIndex = Math.floor(Math.random() * spawnPoints.length);
    item.style.left = `${spawnPoints[spawnIndex]}%`;
    item.style.top = "-50px";
    gameContainer.appendChild(item);

    fallDown(item, spawnIndex);
}

// Функция падения элементов
function fallDown(item, spawnIndex) {
    let fallSpeed = 2 + level * 0.5;
    let interval = setInterval(() => {
        item.style.top = `${parseInt(item.style.top) + fallSpeed}px`;

        if (parseInt(item.style.top) > window.innerHeight - 80) {
            if (spawnIndex === basketIndex) {
                handleCatch(item.dataset.type);
            }
            gameContainer.removeChild(item);
            clearInterval(interval);
        }
    }, 15 - level); // Чем выше уровень, тем быстрее предметы падают
}

// Функция обработки пойманных предметов
function handleCatch(type) {
    if (type === "coin") {
        score += 100;
    } else if (type === "diamond") {
        score += 500;
    } else if (type === "heart") {
        lives = Math.min(5, lives + 1);
    } else if (type === "bomb") {
        lives--;
        if (lives <= 0) {
            alert("Game Over! Final Score: " + score);
            resetGame();
            return;
        }
    }

    updateUI();
    checkLevelUp();
}

// Проверка на повышение уровня
function checkLevelUp() {
    const levelThresholds = [1000, 2000, 3000, 5000, 7500, 10000, 14000, 20000, 25000];
    if (level < 10 && score >= levelThresholds[level - 1]) {
        level++;
        updateUI();
    }
}

// Обновление интерфейса
function updateUI() {
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    levelDisplay.textContent = level;
}

// Функция сброса игры
function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    updateUI();
}

// Движение корзины
function moveBasket(direction) {
    if (direction === "left" && basketIndex > 0) {
        basketIndex--;
    } else if (direction === "right" && basketIndex < spawnPoints.length - 1) {
        basketIndex++;
    }
    basket.style.left = `${spawnPoints[basketIndex]}%`;
}

// Управление с клавиатуры
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        moveBasket("left");
    } else if (event.key === "ArrowRight") {
        moveBasket("right");
    }
});

// Мобильное управление
document.addEventListener("touchstart", (event) => {
    let touchX = event.touches[0].clientX;
    let screenWidth = window.innerWidth;

    if (touchX < screenWidth / 2) {
        moveBasket("left");
    } else {
        moveBasket("right");
    }
});

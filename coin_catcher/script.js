const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

const spawnPositions = [50, 125, 200, 275, 350]; // Точки спавна (объекты и игрок)
const player = {
    x: spawnPositions[2], // Начальная позиция игрока (по центру)
    y: 550,
    width: 50,
    height: 50,
    speed: 1,
    index: 2 // Индекс позиции на оси X
};

const objects = [];
let score = 0;
let lives = 3;
let level = 1;
let gameSpeed = 2; // Начальная скорость падения

const levelThresholds = [500, 1000, 2000, 3000, 5000, 7500, 10000, 12500, 15000, 20000, 25000];

document.addEventListener("keydown", movePlayer);
canvas.addEventListener("click", movePlayer);

function movePlayer(event) {
    if (event.key === "ArrowLeft" || event.clientX < canvas.width / 2) {
        if (player.index > 0) {
            player.index--;
            player.x = spawnPositions[player.index];
        }
    } else if (event.key === "ArrowRight" || event.clientX > canvas.width / 2) {
        if (player.index < spawnPositions.length - 1) {
            player.index++;
            player.x = spawnPositions[player.index];
        }
    }
}

function spawnObject() {
    const type = Math.random() < 0.8 ? "coin" : Math.random() < 0.9 ? "diamond" : "bomb";
    objects.push({
        x: spawnPositions[Math.floor(Math.random() * spawnPositions.length)], // Объекты падают в тех же местах, где находится игрок
        y: 0,
        width: 50,
        height: 50,
        type: type
    });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем игрока
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Двигаем и рисуем объекты
    for (let i = 0; i < objects.length; i++) {
        objects[i].y += gameSpeed;

        if (objects[i].type === "coin") {
            ctx.fillStyle = "gold";
        } else if (objects[i].type === "diamond") {
            ctx.fillStyle = "cyan";
        } else {
            ctx.fillStyle = "red";
        }

        ctx.fillRect(objects[i].x, objects[i].y, objects[i].width, objects[i].height);

        // Проверка столкновения с игроком
        if (
            objects[i].y + objects[i].height >= player.y &&
            objects[i].x === player.x
        ) {
            if (objects[i].type === "coin") {
                score += 10;
            } else if (objects[i].type === "diamond") {
                score += 50;
            } else {
                lives -= 1;
            }
            objects.splice(i, 1);
            i--;
        }

        // Удаляем объект, если он вышел за экран
        if (objects[i] && objects[i].y > canvas.height) {
            objects.splice(i, 1);
            i--;
        }
    }

    // Проверяем, достиг ли игрок нового уровня
    for (let i = 0; i < levelThresholds.length; i++) {
        if (score >= levelThresholds[i] && level === i + 1) {
            level++;
            gameSpeed += 0.5; // Увеличиваем скорость падения
        }
    }

    // Обновляем интерфейс
    document.getElementById("score").innerText = score;
    document.getElementById("lives").innerText = lives;
    document.getElementById("level").innerText = level;

    // Проверяем, проиграл ли игрок
    if (lives <= 0) {
        alert(`Game Over! Your score: ${score} | Level: ${level}`);
        resetGame();
    }

    requestAnimationFrame(updateGame);
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    gameSpeed = 2;
    objects.length = 0;
}

// Генерация объектов каждую секунду
setInterval(spawnObject, 1000);
updateGame();

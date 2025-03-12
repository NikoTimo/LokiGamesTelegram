const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

const player = {
    x: 200,
    y: 550,
    width: 40,
    height: 40,
    speed: 100
};

const objects = [];
const spawnPositions = [50, 150, 250, 350];
let score = 0;
let lives = 3;
let gameSpeed = 2;

document.addEventListener("keydown", movePlayer);
canvas.addEventListener("click", movePlayer);

function movePlayer(event) {
    if (event.key === "ArrowLeft" || event.clientX < canvas.width / 2) {
        player.x -= player.speed;
        if (player.x < 0) player.x = 0;
    } else if (event.key === "ArrowRight" || event.clientX > canvas.width / 2) {
        player.x += player.speed;
        if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    }
}

function spawnObject() {
    const type = Math.random() < 0.8 ? "coin" : Math.random() < 0.9 ? "diamond" : "bomb";
    objects.push({
        x: spawnPositions[Math.floor(Math.random() * spawnPositions.length)],
        y: 0,
        width: 30,
        height: 30,
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

        // Проверка столкновения
        if (
            objects[i].y + objects[i].height >= player.y &&
            objects[i].x < player.x + player.width &&
            objects[i].x + objects[i].width > player.x
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

    // Обновляем интерфейс
    document.getElementById("score").innerText = score;
    document.getElementById("lives").innerText = lives;

    // Проверяем, проиграл ли игрок
    if (lives <= 0) {
        alert("Game Over! Your score: " + score);
        resetGame();
    }

    requestAnimationFrame(updateGame);
}

function resetGame() {
    score = 0;
    lives = 3;
    objects.length = 0;
    gameSpeed = 2;
}

// Ускоряем игру каждые 10 секунд
setInterval(() => {
    gameSpeed += 0.2;
}, 10000);

setInterval(spawnObject, 1000);
updateGame();
 

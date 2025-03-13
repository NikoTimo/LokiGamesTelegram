const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 280;
canvas.height = 450;

const spawnPositions = [20, 80, 140, 200, 260]; 
const player = {
    x: spawnPositions[2], 
    y: 400,
    width: 50,
    height: 50,
    speed: 1,
    index: 2 
};

const objects = [];
let score = 0;
let lives = 3;
let level = 1;
let gameSpeed = 2;
let bombChance = 0.05;

const levelThresholds = [500, 1000, 2000, 3000, 5000, 7500, 10000, 12500, 15000, 20000, 25000];

const images = {
    player: new Image(),
    coin: new Image(),
    diamond: new Image(),
    bomb: new Image(),
    heart: new Image()
};

images.player.src = "player.png";
images.coin.src = "coin.png";
images.diamond.src = "diamond.png";
images.bomb.src = "bomb.png";
images.heart.src = "hearth.png";

// Проверка ориентации экрана
function checkOrientation() {
    const warning = document.getElementById("orientation-warning");
    if (window.innerWidth > window.innerHeight) {
        warning.style.display = "flex";
        canvas.style.display = "none";
    } else {
        warning.style.display = "none";
        canvas.style.display = "block";
    }
}

// Исправляем проблему с отсутствием игры
window.addEventListener("resize", checkOrientation);
document.addEventListener("DOMContentLoaded", () => {
    checkOrientation();
    updateGame();
});

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

document.addEventListener("keydown", movePlayer);
canvas.addEventListener("click", movePlayer);

function spawnObject() {
    let rand = Math.random();
    let type;

    if (rand < bombChance) {
        type = "bomb";
    } else if (rand < 0.1) {
        type = "heart";
    } else if (rand < 0.8) {
        type = "coin";
    } else {
        type = "diamond";
    }

    objects.push({
        x: spawnPositions[Math.floor(Math.random() * spawnPositions.length)],
        y: 0,
        width: 40,
        height: 40,
        type: type
    });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(images.player, player.x, player.y, player.width, player.height);

    for (let i = 0; i < objects.length; i++) {
        objects[i].y += gameSpeed;

        let image;
        if (objects[i].type === "coin") {
            image = images.coin;
        } else if (objects[i].type === "diamond") {
            image = images.diamond;
        } else if (objects[i].type === "heart") {
            image = images.heart;
        } else {
            image = images.bomb;
        }

        ctx.drawImage(image, objects[i].x, objects[i].y, objects[i].width, objects[i].height);

        if (objects[i].y + objects[i].height >= player.y && objects[i].x === player.x) {
            if (objects[i].type === "coin") {
                score += 10;
            } else if (objects[i].type === "diamond") {
                score += 50;
            } else if (objects[i].type === "heart") {
                lives += 1;
                score += 100;
            } else {
                lives -= 1;
            }
            objects.splice(i, 1);
            i--;
        }

        if (objects[i] && objects[i].y > canvas.height) {
            objects.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < levelThresholds.length; i++) {
        if (score >= levelThresholds[i] && level === i + 1) {
            level++;
            gameSpeed += 0.5;
            if (level >= 3) gameSpeed += 0.2;
            if (level <= 10) bombChance += 0.01;
        }
    }

    document.getElementById("score").innerText = score;
    document.getElementById("lives").innerText = lives;
    document.getElementById("level").innerText = level;

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
    bombChance = 0.05;
    objects.length = 0;
}

// Генерация объектов каждую секунду
setInterval(spawnObject, 1000);

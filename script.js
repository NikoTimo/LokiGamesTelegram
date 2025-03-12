const emojis = ['😀','😎','🐱','🐶','🐼','🐸','🐥','🐢','🌵','🌍','🚀','🚁','⚽','🎸','🎮','🎲','📱','💡'];
let cards = [...emojis, ...emojis];
let flippedCards = [];
let matchedPairs = 0;

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function createBoard() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    cards = shuffle(cards);
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.index = index;
        card.onclick = () => flipCard(card, emoji);
        grid.appendChild(card);
    });
}

function flipCard(card, emoji) {
    if (flippedCards.length < 2 && !card.classList.contains('matched')) {
        card.innerText = emoji;
        flippedCards.push({ card, emoji });

        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 500);
        }
    }
}

function checkMatch() {
    const [first, second] = flippedCards;
    if (first.emoji === second.emoji) {
        first.card.classList.add('matched');
        second.card.classList.add('matched');
        matchedPairs++;
        if (matchedPairs === emojis.length) {
            alert('You Win!');
            sendResultToTelegram();
        }
    } else {
        first.card.innerText = '';
        second.card.innerText = '';
    }
    flippedCards = [];
}

function sendResultToTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.sendData("Game completed!");
    }
}

function restartGame() {
    flippedCards = [];
    matchedPairs = 0;
    createBoard();
}

createBoard();

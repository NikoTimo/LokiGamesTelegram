const secretCode = generateCode();
let attempts = 0;
let currentGuess = [];

const currentGuessDiv = document.getElementById("currentGuess");
const guessesDiv = document.getElementById("guesses");
const resultDiv = document.getElementById("result");
const keyboardDiv = document.getElementById("keyboard");

function generateCode() {
  const digits = '0123456789';
  let code = '';
  while (code.length < 6) {
    const d = digits[Math.floor(Math.random() * 10)];
    if (!code.includes(d)) code += d;
  }
  return code;
}

function buildKeyboard() {
  for (let i = 0; i <= 9; i++) {
    const img = document.createElement("img");
    img.src = `assets/B${i}.png`;
    img.onclick = () => addSymbol(i);
    keyboardDiv.appendChild(img);
  }
}

function addSymbol(digit) {
  if (currentGuess.length >= 6) return;
  currentGuess.push(digit);
  renderCurrentGuess();
}

function clearGuess() {
  currentGuess = [];
  renderCurrentGuess();
}

function renderCurrentGuess() {
  currentGuessDiv.innerHTML = "";
  for (let i = 0; i < currentGuess.length; i++) {
    const img = document.createElement("img");
    img.src = `assets/B${currentGuess[i]}.png`;
    currentGuessDiv.appendChild(img);
  }
}

function submitGuess() {
  if (currentGuess.length !== 6) {
    alert("Выбери 6 символов.");
    return;
  }

  const guess = currentGuess.join("");
  const result = compareCodes(secretCode, guess);
  renderGuess(guess, result);
  attempts++;
  clearGuess();

  if (result.bulls === 6) {
    resultDiv.innerText = "🔓 Шифр разгадан!";
    keyboardDiv.innerHTML = "";
  } else if (attempts >= 5) {
    resultDiv.innerText = `❌ Попытки закончились. Код был: ${secretCode}`;
    keyboardDiv.innerHTML = "";
  }
}

function compareCodes(secret, guess) {
  let bulls = 0, cows = 0;
  for (let i = 0; i < 6; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else if (secret.includes(guess[i])) {
      cows++;
    }
  }
  return { bulls, cows };
}

function renderGuess(guess, result) {
  const row = document.createElement("div");
  row.className = "guess-line";

  for (let i = 0; i < 6; i++) {
    const img = document.createElement("img");
    const color =
      guess[i] === secretCode[i]
        ? "G"
        : secretCode.includes(guess[i])
        ? "Y"
        : "B";
    img.src = `assets/${color}${guess[i]}.png`;
    row.appendChild(img);
  }

  guessesDiv.appendChild(row);
}

buildKeyboard();

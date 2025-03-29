const secretCode = generateCode();
let attempts = 0;

function generateCode() {
  const digits = '0123456789';
  let code = '';
  while (code.length < 6) {
    const d = digits[Math.floor(Math.random() * 10)];
    if (!code.includes(d)) code += d;
  }
  return code;
}

function submitGuess() {
  const input = document.getElementById("guessInput");
  const guess = input.value;
  if (guess.length !== 6 || !/^\d+$/.test(guess)) {
    alert("Введите ровно 6 цифр от 0 до 9.");
    return;
  }

  const result = compareCodes(secretCode, guess);
  renderGuess(guess, result);

  attempts++;
  input.value = "";

  if (result.bulls === 6) {
    document.getElementById("result").innerText = "🔓 Шифр разгадан!";
    document.getElementById("inputRow").style.display = "none";
  } else if (attempts >= 5) {
    document.getElementById("result").innerText = `❌ Попытки закончились. Код был: ${secretCode}`;
    document.getElementById("inputRow").style.display = "none";
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

  const text = document.createElement("span");
  text.innerText = ` — 🟢 ${result.bulls} | 🟡 ${result.cows}`;
  row.appendChild(text);

  document.getElementById("guesses").appendChild(row);
}

const tg = window.Telegram.WebApp;
tg.expand();

let score = parseInt(localStorage.getItem('click_score')) || 0;
let best = parseInt(localStorage.getItem('best_score')) || 0;
let level = 1;
let timeLeft = 30;

const scoreElement = document.getElementById('score');
const bestElement = document.getElementById('best');
const levelElement = document.getElementById('level');
const timeElement = document.getElementById('time');
const clickButton = document.getElementById('clickButton');
const trapButton = document.getElementById('trapButton');

scoreElement.textContent = score;
bestElement.textContent = best;

const timer = setInterval(() => {
  timeLeft--;
  timeElement.textContent = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(timer);
    clickButton.disabled = true;
    trapButton.style.display = 'none';
    alert(`Время вышло! Твой счёт: ${score}`);
    if (score > best) {
      localStorage.setItem('best_score', score);
    }

    // Отправить результат в Telegram боту
    tg.sendData(JSON.stringify({ score, level }));
  }
}, 1000);

clickButton.addEventListener('click', () => {
  score++;
  scoreElement.textContent = score;
  localStorage.setItem('click_score', score);

  if (score % 10 === 0) {
    level++;
    levelElement.textContent = level;
    clickButton.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
  }
});

// Ловушка кнопка
trapButton.onclick = () => {
  score = 0;
  level = 1;
  localStorage.setItem('click_score', score);
  scoreElement.textContent = score;
  levelElement.textContent = level;
  alert('Ты попался!');
};

setInterval(() => {
  trapButton.style.display = 'inline-block';
  setTimeout(() => trapButton.style.display = 'none', 3000);
}, 10000);

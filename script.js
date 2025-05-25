let count = 0;
const counter = document.getElementById('counter');
const clickBtn = document.getElementById('clickBtn');

clickBtn.addEventListener('click', () => {
  count++;
  counter.textContent = count;
});

// Активация Telegram Web App интерфейса
Telegram.WebApp.ready();
Telegram.WebApp.expand();

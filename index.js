require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const db = require('./database');
const { generatePaymentLink, checkPaymentStatus } = require('./payment');

const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${WEBHOOK_URL}/bot${TOKEN}`);

console.log('Webhook установлен:', `${WEBHOOK_URL}/bot${TOKEN}`);

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/pay/, (msg) => {
  const chatId = msg.chat.id;

  const { paymentId, paymentUrl } = generatePaymentLink(chatId);

  db.run(
    `INSERT INTO payments (chat_id, payment_id, payment_url) VALUES (?, ?, ?)`,
    [chatId, paymentId, paymentUrl],
    (err) => {
      if (err) {
        console.error(`Ошибка записи в БД: ${err.message}`);
        bot.sendMessage(chatId, 'Ошибка при создании ссылки на оплату. Попробуйте позже.');
        return;
      }

      bot.sendMessage(chatId, '💳 Пожалуйста, перейдите по ссылке для оплаты:', {
        reply_markup: {
          inline_keyboard: [[{ text: '🔗 Оплатить', url: paymentUrl }]],
        },
      });
    }
  );
});

// Периодическая проверка оплаты
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 минут

setInterval(() => {
  db.all(`SELECT id, chat_id, payment_url FROM payments WHERE status = 'pending'`, [], async (err, rows) => {
    if (err) {
      console.error(`Ошибка выборки платежей: ${err.message}`);
      return;
    }

    for (const row of rows) {
      const isPaid = await checkPaymentStatus(row.payment_url);
      if (isPaid) {
        db.run(`UPDATE payments SET status = 'paid' WHERE id = ?`, [row.id], (updateErr) => {
          if (updateErr) {
            console.error(`Ошибка обновления статуса оплаты: ${updateErr.message}`);
            return;
          }
          bot.sendMessage(row.chat_id, '✅ Оплата подтверждена! Спасибо за ваш платеж.');
        });
      }
    }
  });
}, CHECK_INTERVAL);

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

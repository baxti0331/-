const axios = require('axios');
const cheerio = require('cheerio');
const PAYMENT_BASE_URL = process.env.PAYMENT_BASE_URL;

function generatePaymentLink(chatId) {
  const uniquePaymentId = `payment_${chatId}_${Date.now()}`;
  const paymentUrl = `${PAYMENT_BASE_URL}/${uniquePaymentId}`;
  return { paymentId: uniquePaymentId, paymentUrl };
}

async function checkPaymentStatus(paymentUrl) {
  try {
    const response = await axios.get(paymentUrl);
    const $ = cheerio.load(response.data);
    const bodyText = $('body').text().toLowerCase();
    return bodyText.includes('оплачено') || bodyText.includes('paid');
  } catch (error) {
    console.error(`Ошибка проверки оплаты: ${error.message}`);
    return false;
  }
}

module.exports = { generatePaymentLink, checkPaymentStatus };

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes

import os

BOT_TOKEN = os.getenv("BOT_TOKEN")  # Возьмём токен из переменной окружения

PRODUCTS = {
    "product1": {"name": "Товар 1", "price": 10},
    "product2": {"name": "Товар 2", "price": 25},
    "product3": {"name": "Товар 3", "price": 50},
}

def generate_payment_link(product_key: str):
    product = PRODUCTS[product_key]
    base_url = "https://payment.tome.ge/create"
    amount = product["price"]
    description = product["name"]
    return f"{base_url}?amount={amount}&description={description}"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton(prod["name"], callback_data=key)]
        for key, prod in PRODUCTS.items()
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("Выберите товар для оплаты:", reply_markup=reply_markup)

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    product_key = query.data
    link = generate_payment_link(product_key)
    await query.edit_message_text(text=f"Для оплаты {PRODUCTS[product_key]['name']} перейдите по ссылке:\n{link}")

def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_handler))
    print("Бот запущен...")
    app.run_polling()

if __name__ == "__main__":
    main()

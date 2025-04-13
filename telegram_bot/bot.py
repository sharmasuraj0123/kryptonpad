#!/usr/bin/env python3
import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackContext

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Telegram bot token
TOKEN = "7998576730:AAEIhyVgIcgH1C7oe6z83E-IBlHQVq8j3x4"

# URL to open in web view
WEBAPP_URL = "https://up-serval-awaited.ngrok-free.app"

async def start(update: Update, context: CallbackContext) -> None:
    """Send a message when the command /start is issued."""
    await update.message.reply_text(
        "Hi! I'm your bot. Use /open to open the web view."
    )

async def open_webview(update: Update, context: CallbackContext) -> None:
    """Open a web view when the command /open is issued."""
    keyboard = [
        [InlineKeyboardButton("Open Web App", web_app=WebAppInfo(url=WEBAPP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Click the button below to open the web view:",
        reply_markup=reply_markup
    )

def main() -> None:
    """Start the bot."""
    # Create the Application
    application = Application.builder().token(TOKEN).build()

    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("open", open_webview))

    # Run the bot until the user presses Ctrl-C
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main() 
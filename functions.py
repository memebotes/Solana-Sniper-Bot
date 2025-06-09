from pyfiglet import Figlet
import json
import httpx

def notify_discord(content: str):
    webhook_url = get_settings()['DISCORD_WEBHOOK']
    try:
        httpx.post(webhook_url, json={'content': f'{content}'})
    except:
        pass

def notify_telegram(content: str):
    settings = get_settings()
    bot_token = settings['TELEGRAM_BOT_TOKEN']
    chat_id = settings['TELEGRAM_CHAT_ID']
    telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': content,
        'parse_mode': 'HTML'
    }
    try:
        httpx.post(url=telegram_url, data=payload)
    except:
        pass

def print_logo() -> None:
    print("\033c\n", end="")
    print("-" * 51, "\n" + Figlet(font='small').renderText('ALT BOT\n') + "-" * 51 + "\n")

def get_settings() -> dict:
    with open('config.json', 'r') as config_file:
        return json.load(config_file)

def load_wallet_list() -> dict:
    with open('wallets.json', 'r') as wallets_file:
        return json.load(wallets_file)

def fetch_crypto_price(symbol: str) -> float:
    api_url = f"https://www.binance.com/api/v3/ticker/price?symbol={symbol}USDT"
    price = float(httpx.get(api_url).json()['price'])
    return price

def format_timestamp(seconds: int) -> str:
    if seconds < 60:
        return f"{seconds} seconds"
    elif seconds < 3600:
        minutes = seconds // 60
        sec = seconds % 60
        return f"{minutes} minutes and {sec} seconds"
    elif seconds < 86400:
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        return f"{hours} hours, {minutes} minutes"
    elif seconds < 604800:
        days = seconds // 86400
        hours = (seconds % 86400) // 3600
        return f"{days} days, {hours} hours"
    elif seconds < 2629746:
        weeks = seconds // 604800
        days = (seconds % 604800) // 86400
        return f"{weeks} weeks, {days} days"
    else:
        months = seconds // 2629746
        days = (seconds % 2629746) // 86400
        return f"{months} months, {days} days"
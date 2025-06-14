import json
import base58
import base64
import time
import re
import httpx
import asyncio
from  multiprocessing import Process
import random
from dexscreener import DexscreenerClient


from datetime import datetime

from InquirerPy import inquirer

from tabulate import tabulate
import pandas as pd

from yaspin import yaspin

from solders import message
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.transaction import VersionedTransaction
from solders.signature import Signature
from solders.system_program import transfer, TransferParams


from solana.rpc.async_api import AsyncClient
from solana.rpc.api import Client
from solana.rpc.commitment import Processed
from solana.rpc.types import TxOpts
from solana.transaction import Transaction

from spl.token.instructions import get_associated_token_wallet


from jupiter_python_sdk.jupiter import Jupiter, Jupiter_DCA


import functions as f
import constants as c


class Config_CLI():
    
    @staticmethod
    async def get_config_data() -> dict:
        """Fetch config file data.
        Returns: dict"""
        with open('config.json', 'r') as config_file:
            return json.load(config_file)
        
    @staticmethod
    def get_config_data_no_async() -> dict:
        """Fetch config file data.
        Returns: dict"""
        with open('config.json', 'r') as config_file:
            return json.load(config_file)
        
    @staticmethod
    async def edit_config_file(config_data: dict):
        """Edit config file."""
        with open('config.json', 'w') as config_file:
            json.dump(config_data, config_file, indent=4)
        return True
    
    @staticmethod
    async def edit_tokens_file(tokens_data: dict):
        """Edit tokens file."""
        with open('tokens.json', 'w') as tokens_file:
            json.dump(tokens_data, tokens_file, indent=4)
        return True
    
    @staticmethod
    def edit_tokens_file_no_async(tokens_data: dict):
        """Edit tokens file."""
        with open('tokens.json', 'w') as tokens_file:
            json.dump(tokens_data, tokens_file, indent=4)
        return True
    
    @staticmethod
    async def get_tokens_data() -> dict:
        """Fetch token file data.
        Returns: dict"""
        with open('tokens.json', 'r') as tokens_file:
            return json.load(tokens_file)
        
    @staticmethod
    def get_tokens_data_no_async() -> dict:
        """Fetch token file data.
        Returns: dict"""
        with open('tokens.json', 'r') as tokens_file:
            return json.load(tokens_file)
        
    @staticmethod
    async def ai_collect_fees():
        """Asks the user if they want the CLI to take a small percentage of fees during their swaps."""
        collect_fees = inquirer.select(message="Would you like CLI to collect small fees from your swaps? (0.005%)", choices=["Yes", "No"]).execute_async()
        confirm = inquirer.select(message="Confirm?", choices=["Yes", "No"]).execute_async()
        if confirm == "Yes":
            config_data = Config_CLI.get_config_data()
            config_data['COLLECT_FEES'] = True if collect_fees == "Yes" else False
            Config_CLI.edit_config_file(config_data=config_data)
            return
        elif confirm == "No":
            Config_CLI.ai_collect_fees()
            return

    @staticmethod
    async def ai_rpc_url():
        """Asks the user the RPC URL endpoint to be used."""
        config_data = await Config_CLI.get_config_data()
        rpc_url = await inquirer.text(message="Enter your Solana RPC URL endpoint or press ENTER to skip:").execute_async()
        # rpc_url = os.getenv('RPC_URL')
        # confirm = "Yes"
        
        if rpc_url == "" and config_data['RPC_URL'] is None:
            print(f"{c.RED}! You need to have a RPC endpoint to user the CLI")
            await Config_CLI.ai_rpc_url()
            return
	
        elif rpc_url != "":
            confirm = await inquirer.select(message="Confirm Solana RPC URL Endpoint?", choices=["Yes", "No"]).execute_async()
            if confirm == "Yes":
                if rpc_url.endswith("/"):
                    rpc_url = rpc_url[:-1]
                    
                test_client = AsyncClient(endpoint=rpc_url)
                
                if not await test_client.is_connected():
                    print(f"{c.RED}! Connection to RPC failed. Please enter a valid RPC.{c.RESET}")
                    await Config_CLI.ai_rpc_url()
                    return
                else:
                    config_data['RPC_URL'] = rpc_url
                    await Config_CLI.edit_config_file(config_data=config_data)
                    return
            
            elif confirm == "No":
                await Config_CLI.ai_rpc_url()
                return

        return rpc_url
    
    @staticmethod
    async def ai_discord_webhook():
        """Asks user Discord Webhook URL to be notified for Sniper tool."""
        config_data = await Config_CLI.get_config_data()
        discord_webhook = await inquirer.text(message="Enter your Discord Webhook or press ENTER to skip:").execute_async()
        
        if discord_webhook  != "":
            confirm = await inquirer.select(message="Confirm Discord Webhook?", choices=["Yes", "No"]).execute_async()
            
            if confirm == "Yes":
                config_data['DISCORD_WEBHOOK'] = discord_webhook
                await Config_CLI.edit_config_file(config_data=config_data)
                f.send_discord_alert("Discord Alert added!")
                
                confirm = await inquirer.select(message="Is message sent in the Discord channel?", choices=["Yes", "No"]).execute_async()
                if confirm == "No":
                    await Config_CLI.ai_discord_webhook()
                    return
            
            elif confirm == "No":
                await Config_CLI.ai_discord_webhook()
                return
        
        return discord_webhook
    
    @staticmethod
    async def ai_telegram_api():
        """Asks user Telegram API to be notified for Sniper tool."""
        config_data = await Config_CLI.get_config_data()
        telegram_bot_token = await inquirer.text(message="Enter Telegram Bot Token or press ENTER to skip:").execute_async()
        
        if telegram_bot_token  != "":
            confirm = await inquirer.select(message="Confirm Telegram Bot Token?", choices=["Yes", "No"]).execute_async()
            
            if confirm == "Yes":
                config_data['TELEGRAM_BOT_TOKEN'] = telegram_bot_token
                
                while True:
                    telegram_bot_token = await inquirer.text(message="Enter Telegram Chat ID").execute_async()
                    confirm = await inquirer.select(message="Confirm Telegram Chat ID?", choices=["Yes", "No"]).execute_async()
                    
                    if confirm == "Yes":
                        config_data['TELEGRAM_CHAT_ID'] = int(telegram_bot_token)
                        await Config_CLI.edit_config_file(config_data=config_data)
                        f.send_telegram_alert("Telegram Alert added!")
                
                        confirm = await inquirer.select(message="Is message sent in the Telegram channel?", choices=["Yes", "No"]).execute_async()
                        if confirm == "No":
                            await Config_CLI.ai_telegram_api()
                            return
                        
                        break
                
                return
            
            elif confirm == "No":
                await Config_CLI.ai_telegram_api()
                return
        
        return
    
    @staticmethod
    async def main_menu():
        """Main menu for CLI settings."""
        f.display_logo()
        print("[CLI SETTINGS]\n")
        config_data = await Config_CLI.get_config_data()
        
        # print(f"CLI collect fees (0.005%): {'Yes' if config_data['COLLECT_FEES'] else 'No'}") # TBD
        
        client = AsyncClient(endpoint=config_data['RPC_URL'])
        start_time = time.time()
        await client.is_connected()
        end_time = time.time()
        print(f"RPC URL Endpoint: {config_data['RPC_URL']} {c.GREEN}({round(end_time - start_time, 2)} ms){c.RESET}")
        print("Discord Webhook:", config_data['DISCORD_WEBHOOK'])
        print("Telegram Bot Token:", config_data['TELEGRAM_BOT_TOKEN'], "| Channel ID:", config_data['TELEGRAM_CHAT_ID'])
        
        print()
        
        config_cli_ai_main_menu = await inquirer.select(message="Select CLI parameter to change:", choices=[
            # "CLI collect fees", # TBD
            "Solana RPC URL Endpoint",
            "Discord",
            "Telegram",
            "Back to main menu",
        ]).execute_async()
        
        match config_cli_ai_main_menu:
            case "CLI collect fees":
                await Config_CLI.ai_collect_fees()
                await Config_CLI.main_menu()
            case "Solana RPC URL Endpoint":
                await Config_CLI.ai_rpc_url()
                await Config_CLI.main_menu()
            case "Discord":
                await Config_CLI.ai_discord_webhook()
                await Config_CLI.main_menu()
            case "Telegram":
                await Config_CLI.ai_telegram_api()
                await Config_CLI.main_menu()
            case "Back to main menu":
                await Main_CLI.main_menu()
                return


class Wallet():
    
    def __init__(self, rpc_url: str, private_key: str, async_client: bool=True):
        self.wallet = Keypair.from_bytes(base58.b58decode(private_key))
        if async_client:
            self.client = AsyncClient(endpoint=rpc_url)
        else:
            self.client = Client(endpoint=rpc_url)


    async def get_token_balance(self, token_mint_wallet: str) -> dict:
        
        if token_mint_wallet == self.wallet.pubkey().__str__():
            get_token_balance = await self.client.get_balance(pubkey=self.wallet.pubkey())
            token_balance = {
                'decimals': 9,
                'balance': {
                    'int': get_token_balance.value,
                    'float': float(get_token_balance.value / 10 ** 9)
                }
            }
        else:
            get_token_balance = await self.client.get_token_wallet_balance(pubkey=token_mint_wallet)
            try:
                token_balance = {
                    'decimals': int(get_token_balance.value.decimals),
                    'balance': {
                        'int': get_token_balance.value.amount,
                        'float': float(get_token_balance.value.amount) / 10 ** int(get_token_balance.value.decimals)
                    }
                }
            except AttributeError:
                token_balance = {
                    'decimals': 0,
                    'balance': {
                        'int': 0,
                        'float':0
                    }
                }
        
        return token_balance
    
    def get_token_balance_no_async(self, token_mint_wallet: str) -> dict:
        
        if token_mint_wallet == self.wallet.pubkey().__str__():
            get_token_balance = self.client.get_balance(pubkey=self.wallet.pubkey())
            token_balance = {
                'decimals': 9,
                'balance': {
                    'int': get_token_balance.value,
                    'float': float(get_token_balance.value / 10 ** 9)
                }
            }
        else:
            get_token_balance = self.client.get_token_wallet_balance(pubkey=token_mint_wallet)
            try:
                token_balance = {
                    'decimals': int(get_token_balance.value.decimals),
                    'balance': {
                        'int': get_token_balance.value.amount,
                        'float': float(get_token_balance.value.amount) / 10 ** int(get_token_balance.value.decimals)
                    }
                }
            except AttributeError:
                token_balance = {'balance': {'int': 0, 'float':0}}
        
        return token_balance
    
    
    async def get_token_mint_wallet(self, token_mint: str) -> Pubkey:
        token_mint_wallet = get_associated_token_wallet(owner=self.wallet.pubkey(), mint=Pubkey.from_string(token_mint))
        return token_mint_wallet
    
    def get_token_mint_wallet_no_async(self, token_mint: str) -> Pubkey:
        token_mint_wallet = get_associated_token_wallet(owner=self.wallet.pubkey(), mint=Pubkey.from_string(token_mint))
        return token_mint_wallet
    
    
    async def sign_send_transaction(self, transaction_data: str, signatures_list: list=None, print_link: bool=True):
        signatures = []

        raw_transaction = VersionedTransaction.from_bytes(base64.b64decode(transaction_data))
        signature = self.wallet.sign_message(message.to_bytes_versioned(raw_transaction.message))
        signatures.append(signature)
        if signatures_list:
            for signature in signatures_list:
                signatures.append(signature)
        signed_txn = VersionedTransaction.populate(raw_transaction.message, signatures)
        opts = TxOpts(skip_preflight=True, preflight_commitment=Processed)
        
        # print(signatures, transaction_data)
        # input()
        
        result = await self.client.send_raw_transaction(txn=bytes(signed_txn), opts=opts)
        transaction_hash = json.loads(result.to_json())['result']
        if print_link is True:
            print(f"{c.GREEN}Transaction sent: https://explorer.solana.com/tx/{transaction_hash}{c.RESET}")
            await inquirer.text(message="\nPress ENTER to continue").execute_async()
        # await self.get_status_transaction(transaction_hash=transaction_hash) # TBD
        return
    
    def sign_send_transaction_no_async(self, transaction_data: str, signatures_list: list=None, print_link: bool=True):
        signatures = []

        raw_transaction = VersionedTransaction.from_bytes(base64.b64decode(transaction_data))
        signature = self.wallet.sign_message(message.to_bytes_versioned(raw_transaction.message))
        signatures.append(signature)
        if signatures_list:
            for signature in signatures_list:
                signatures.append(signature)
        signed_txn = VersionedTransaction.populate(raw_transaction.message, signatures)
        opts = TxOpts(skip_preflight=True, preflight_commitment=Processed)
        
        # print(signatures, transaction_data)
        # input()
        
        result = self.client.send_raw_transaction(txn=bytes(signed_txn), opts=opts)
        transaction_hash = json.loads(result.to_json())['result']
        if print_link is True:
            print(f"{c.GREEN}Transaction sent: https://explorer.solana.com/tx/{transaction_hash}{c.RESET}")
        # await self.get_status_transaction(transaction_hash=transaction_hash) # TBD
        return
        

    async def get_status_transaction(self, transaction_hash: str):
        print("Checking transaction status...")
        get_transaction_details = await self.client.confirm_transaction(tx_sig=Signature.from_string(transaction_hash), sleep_seconds=1)
        transaction_status = get_transaction_details.value[0].err
        
        if transaction_status is None:
            print("Transaction SUCCESS!")
        else:
            print(f"{c.RED}! Transaction FAILED!{c.RESET}")
            
        await inquirer.text(message="\nPress ENTER to continue").execute_async()
        return
            

snipers_processes = []
class Token_Sniper():
    
    def __init__(self, token_id, token_data):
        self.token_id = token_id
        self.token_data = token_data
        self.success = False
    
    def snipe_token(self):
                    
        tokens_data = Config_CLI.get_tokens_data_no_async()
        config_data = Config_CLI.get_config_data_no_async()
        wallets = CLI_Wallets.get_wallets_no_async()
        wallet = Wallet(rpc_url=config_data['RPC_URL'], private_key=wallets[str(tokens_data[self.token_id]['WALLET'])]['private_key'], async_client=False)
        token_wallet = wallet.get_token_mint_wallet_no_async(self.token_data['wallet'])
        token_balance = wallet.get_token_balance_no_async(token_mint_wallet=token_wallet)
        
        while True:
            if self.token_data['STATUS'] in ["NOT IN", "ERROR WHEN SWAPPING"]:
            
                while True:
                    if self.token_data['TIMESTAMP'] is None:
                        time.sleep(1)
                    elif self.token_data['TIMESTAMP'] is not None:
                        sleep_time = self.token_data['TIMESTAMP'] - int(time.time()) - 3
                        try:
                            time.sleep(sleep_time)
                        except ValueError:
                            pass
                    
                    sol_price = f.get_crypto_price('SOL')
                    amount = int((self.token_data['BUY_AMOUNT']*10**9) / sol_price)
                    quote_url = "https://quote-api.jup.ag/v6/quote?" + f"inputMint=So11111111111111111111111111111111111111112" + f"&outputMint={self.token_data['wallet']}" + f"&amount={amount}" + f"&slippageBps={int(self.token_data['SLIPPAGE_BPS'])}"
                    quote_response = httpx.get(url=quote_url).json()
                    
                    try:
                        if quote_response['error']:
                            time.sleep(1)
                    except:
                        break
                
                swap_data = {
                    "quoteResponse": quote_response,
                    "userPublicKey": wallet.wallet.pubkey().__str__(),
                    "wrapUnwrapSOL": True
                }
                
                retries = 0
                while True:
                    try:
                        get_swap_data = httpx.post(url="https://quote-api.jup.ag/v6/swap", json=swap_data).json()
                        swap_data = get_swap_data['swapTransaction']
                        wallet.sign_send_transaction_no_async(transaction_data=swap_data, print_link=False)
                        self.success = True
                        break
                    except:
                        if retries == 3:
                            self.success = False
                            break
                        retries += 1
                        time.sleep(0.5)
                        
                if self.success is True:
                    tokens_data[self.token_id]['STATUS'] = "IN"
                    self.token_data['STATUS'] = "IN"
                    alert_message = f"{self.token_data['NAME']} ({self.token_data['wallet']}): IN"
                    f.send_discord_alert(alert_message)
                    f.send_telegram_alert(alert_message)
                else:
                    tokens_data[self.token_id]['STATUS'] = "ERROR ON SWAPPING"
                    self.token_data['STATUS'] = "ERROR WHEN SWAPPING"
                    alert_message = f"{self.token_data['NAME']} ({self.token_data['wallet']}): BUY FAILED"
                    f.send_discord_alert(alert_message)
                    f.send_telegram_alert(alert_message)
                Config_CLI.edit_tokens_file_no_async(tokens_data)
            
            elif self.token_data['STATUS'] not in ["NOT IN", "ERROR WHEN SWAPPING"] and not self.token_data['STATUS'].startswith('> '):
                time.sleep(1)
                sol_price = f.get_crypto_price('SOL')
                quote_url = "https://quote-api.jup.ag/v6/quote?" + f"inputMint={self.token_data['wallet']}" + f"&outputMint=So11111111111111111111111111111111111111112" + f"&amount={token_balance['balance']['int']}" + f"&slippageBps={int(self.token_data['SLIPPAGE_BPS'])}"
                quote_response = httpx.get(quote_url).json()
                try:
                    out_amount = (int(quote_response['outAmount']) / 10 ** 9) * sol_price
                    
                    amount_usd = out_amount
                    
                    if amount_usd < self.token_data['STOP_LOSS'] or amount_usd > self.token_data['TAKE_earning']:
                        swap_data = {
                            "quoteResponse": quote_response,
                            "userPublicKey": wallet.wallet.pubkey().__str__(),
                            "wrapUnwrapSOL": True
                        }
                        get_swap_data = httpx.post(url="https://quote-api.jup.ag/v6/swap", json=swap_data).json()
                        swap_data = get_swap_data['swapTransaction']
                        wallet.sign_send_transaction_no_async(transaction_data=swap_data, print_link=False)
                        
                        if amount_usd < self.token_data['STOP_LOSS']:
                            tokens_data[self.token_id]['STATUS'] = f"> STOP LOSS"
                            alert_message = f"{self.token_data['NAME']} ({self.token_data['wallet']}): STOP LOSS @ ${amount_usd}"
                            f.send_discord_alert(alert_message)
                            f.send_telegram_alert(alert_message)
                        elif amount_usd > self.token_data['TAKE_earning']:
                            tokens_data[self.token_id]['STATUS'] = f"> TAKE earning"
                            alert_message = f"{self.token_data['NAME']} ({self.token_data['wallet']}): TAKE earning @ ${amount_usd}"
                            f.send_discord_alert(alert_message)
                            f.send_telegram_alert(alert_message)
                        
                        Config_CLI.edit_tokens_file_no_async(tokens_data)
                        break
                # If token balance not synchronized yet (on buy)
                except:
                    pass
            
            else:
                break
            
    @staticmethod
    async def run():
        """Starts all the sniper token instance"""
        tokens_snipe = await Config_CLI.get_tokens_data()
        for token_id, token_data in tokens_snipe.items():
            token_sniper_instance = Token_Sniper(token_id, token_data)
            process = Process(target=token_sniper_instance.snipe_token, args=())
            snipers_processes.append(process)
            
        for sniper_process in snipers_processes:
            sniper_process.start()
    

class Jupiter_CLI(Wallet):
    
    def __init__(self, rpc_url: str, private_key: str) -> None:
        super().__init__(rpc_url=rpc_url, private_key=private_key)
    
    async def main_menu(self):
        """Main menu for Jupiter CLI."""
        f.display_logo()
        print("[JUPITER CLI] [MAIN MENU]")
        await CLI_Wallets.display_selected_wallet()
        self.jupiter = Jupiter(async_client=self.client, keypair=self.wallet)
        
        jupiter_cli_ai_main_menu = await inquirer.select(message="Select menu:", choices=[
            "Swap",
            "Limit Order",
            "DCA",
            "Token Sniper",
            "Change wallet",
            "Back to main menu",
        ]).execute_async()
        
        match jupiter_cli_ai_main_menu:
            case "Swap":
                await self.swap_menu()
                await self.main_menu()
                return
            case "Limit Order":
                await self.limit_order_menu()
                return
            case "DCA":
                await self.dca_menu()
                return
            case "Token Sniper":
                    await self.token_sniper_menu()
                    await self.main_menu()
                    return
            case "Change wallet":
                wallet_id, wallet_private_key = await CLI_Wallets.ai_select_wallet()
                if wallet_private_key:
                    self.wallet = Keypair.from_bytes(base58.b58decode(wallet_private_key))
                await self.main_menu()
                return
            case "Back to main menu":
                await Main_CLI.main_menu()
                return
    
    
    async def select_tokens(self, type_swap: str):
        """ais user to select tokens & amount to sell.
        
        type_swap (str): swap, limit_order, dca
        """
        tokens_list = await Jupiter.get_tokens_list(list_type="all")
        tokens_list_dca = await Jupiter_DCA.get_available_dca_tokens()
            
        choices = []
        for token in tokens_list:
            choices.append(f"{token['symbol']} ({token['wallet']})")
        
        # TOKEN TO SELL
        while True:
            select_sell_token = await inquirer.fuzzy(message="Enter token symbol or wallet you want to sell:", match_exact=True, choices=choices).execute_async()
            
            if select_sell_token is None:
                print(f"{c.RED}! Select a token to sell.{c.RESET}")
            
            elif select_sell_token is not None:
                confirm = await inquirer.select(message="Confirm token to sell?", choices=["Yes", "No"]).execute_async()
                if confirm == "Yes":
                    if select_sell_token == "SOL (So11111111111111111111111111111111111111112)":
                        sell_token_symbol = select_sell_token
                        sell_token_wallet = "So11111111111111111111111111111111111111112"
                        sell_token_wallet = self.wallet.pubkey().__str__()
                    else:
                        sell_token_symbol = re.search(r'^(.*?)\s*\(', select_sell_token).group(1)
                        sell_token_wallet = re.search(r'\((.*?)\)', select_sell_token).group(1)
                        sell_token_wallet = await self.get_token_mint_wallet(token_mint=sell_token_wallet)
                        
                    sell_token_wallet_info = await self.get_token_balance(token_mint_wallet=sell_token_wallet)
                    if sell_token_wallet_info['balance']['float'] == 0:
                        print(f"{c.RED}! You don't have any tokens to sell.{c.RESET}")
                    elif type_swap == "dca" and sell_token_wallet not in tokens_list_dca:
                        print(f"{c.RED}! Selected token to sell is not available for DCA{c.RESET}")
                    else:
                        choices.remove(select_sell_token)
                        break
        
        # TOKEN TO BUY
        while True:
            select_buy_token = await inquirer.fuzzy(message="Enter symbol name or wallet you want to buy:", match_exact=True, choices=choices).execute_async()
                        
            if select_sell_token is None:
                print(f"{c.RED}! Select a token to buy.{c.RESET}")
            
            elif select_sell_token is not None:
                
                confirm = await inquirer.select(message="Confirm token to buy?", choices=["Yes", "No"]).execute_async()
                if confirm == "Yes":
                    if select_buy_token == "SOL":
                        buy_token_symbol = select_buy_token
                        buy_token_wallet = "So11111111111111111111111111111111111111112"
                        buy_token_wallet = self.wallet.pubkey().__str__()
                    else:
                        buy_token_symbol = re.search(r'^(.*?)\s*\(', select_buy_token).group(1)
                        buy_token_wallet = re.search(r'\((.*?)\)', select_buy_token).group(1)
                        buy_token_wallet = await self.get_token_mint_wallet(token_mint=buy_token_wallet)
                    
                    buy_token_wallet_info = await self.get_token_balance(token_mint_wallet=buy_token_wallet)
                    if type_swap == "dca" and sell_token_wallet not in tokens_list_dca:
                        print(f"{c.RED}! Selected token to buy is not available for DCA{c.RESET}")
                    else:
                        choices.remove(select_buy_token)
                        break
        
        # AMOUNT TO SELL
        while True:
            print(f"You own {sell_token_wallet_info['balance']['float']} ${sell_token_symbol}")
            ai_amount_to_sell = await inquirer.number(message="Enter amount to sell:", float_allowed=True, max_allowed=sell_token_wallet_info['balance']['float']).execute_async()
            amount_to_sell = float(ai_amount_to_sell)
            if float(amount_to_sell) == 0:
                print("! Amount to sell cannot be 0.")
            else:
                confirm_amount_to_sell = await inquirer.select(message="Confirm amount to sell?", choices=["Yes", "No"]).execute_async()
                if confirm_amount_to_sell == "Yes":
                    break
        
        return sell_token_symbol, sell_token_wallet, buy_token_symbol, buy_token_wallet, amount_to_sell, sell_token_wallet_info, buy_token_wallet_info
    

    # SWAP
    async def swap_menu(self):  
        """Jupiter CLI - SWAP MENU."""
        f.display_logo()
        print("[JUPITER CLI] [SWAP MENU]")
        print()
        
        sell_token_symbol, sell_token_wallet, buy_token_symbol, buy_token_wallet, amount_to_sell, sell_token_wallet_info, buy_token_wallet_info = await self.select_tokens(type_swap="swap")
        
        # SLIPPAGE BPS
        while True:
            ai_slippage_bps = await inquirer.number(message="Enter slippage percentage (%):", float_allowed=True, min_allowed=0.01, max_allowed=100.00).execute_async()
            slippage_bps = float(ai_slippage_bps)
            
            confirm_slippage = await inquirer.select(message="Confirm slippage percentage?", choices=["Yes", "No"]).execute_async()
            if confirm_slippage == "Yes":
                break
        
        # DIRECT ROUTE
        # direct_route = await inquirer.select(message="Single hop routes only (usually for shitcoins)?", choices=["Yes", "No"]).execute_async()
        # if direct_route == "Yes":
        #     direct_route = True
        # elif direct_route == "No":
        #     direct_route = False

        print()
        print(f"[SELL {amount_to_sell} ${sell_token_symbol} -> ${buy_token_symbol} | SLIPPAGE: {slippage_bps}%]")
        confirm_swap = await inquirer.select(message="Execute swap?", choices=["Yes", "No"]).execute_async()
        if confirm_swap == "Yes":
            try:
                swap_data = await self.jupiter.swap(
                    input_mint=sell_token_wallet,
                    output_mint=buy_token_wallet,
                    amount=int(amount_to_sell*10**sell_token_wallet_info['decimals']),
                    slippage_bps=int(slippage_bps*100),
                    # only_direct_routes=direct_route
                )
                await self.sign_send_transaction(swap_data)
            except:
                print(f"{c.RED}! Swap execution failed.{c.RESET}")
                await inquirer.text(message="\nPress ENTER to continue").execute_async()
            return
        
        elif confirm_swap == "No":
            return
    
    
    # LIMIT trades
    async def limit_order_menu(self):
        """Jupiter CLI - LIMIT ORDER MENU."""
        installing_spinner = yaspin(text=f"{c.BLUE}installing open limit trades{c.RESET}", color="blue")
        installing_spinner.start()
        f.display_logo()
        print("[JUPITER CLI] [LIMIT ORDER MENU]")
        print()
        
        choices = [
            "Open Limit Order",
            "Display Canceled trades History",
            "Display Filled trades History",
            "Back to main menu",
        ]

        open_trades = await Jupiter_CLI.get_open_trades(wallet_wallet=self.wallet.pubkey().__str__())
        if len(open_trades) > 0:
            choices.insert(1, "Cancel Limit Order(s)")
            await Jupiter_CLI.display_open_trades(wallet_wallet=self.wallet.pubkey().__str__())
        
        installing_spinner.stop()
        limit_order_ai_main_menu = await inquirer.select(message="Select menu:", choices=choices).execute_async()
        
        match limit_order_ai_main_menu:
            case "Open Limit Order":
                sell_token_symbol, sell_token_wallet, buy_token_symbol, buy_token_wallet, amount_to_sell, sell_token_wallet_info, buy_token_wallet_info = await self.select_tokens(type_swap="limit_order")
                
                # AMOUNT TO BUY
                while True:
                    amount_to_buy = await inquirer.number(message="Enter amount to buy:", float_allowed=True).execute_async()
                    confirm = await inquirer.select(message="Confirm amount to buy?", choices=["Yes", "No"]).execute_async()
                    if confirm == "Yes":
                        amount_to_buy = float(amount_to_buy)
                        break

                ai_expired_at = await inquirer.select(message="Add expiration to the limit order?", choices=["Yes", "No"]).execute_async()
                if ai_expired_at == "Yes":
                    unit_time_expired_at = await inquirer.select(message="Select unit time:", choices=[
                        "Minute(s)",
                        "Hour(s)",
                        "Day(s)",
                        "Week(s)",
                    ]).execute_async()
                    
                    ai_time_expired_at = await inquirer.number(message=f"Enter the number of {unit_time_expired_at.lower()} before your limit order expires:", float_allowed=False, min_allowed=1).execute_async()
                    ai_time_expired_at = int(ai_time_expired_at)
                    
                    if unit_time_expired_at == "Minute(s)":
                        expired_at = ai_time_expired_at * 60 + int(time.time())
                    elif unit_time_expired_at == "Hour(s)":
                        expired_at = ai_time_expired_at * 3600 + int(time.time())
                    elif unit_time_expired_at == "Day(s)":
                        expired_at = ai_time_expired_at * 86400 + int(time.time())
                    elif unit_time_expired_at == "Week(s)":
                        expired_at = ai_time_expired_at * 604800 + int(time.time())
                
                elif ai_expired_at == "No":
                    expired_at = None
                
                print("")
                expired_at_phrase = "Never Expires" if expired_at is None else f"Expires in {ai_time_expired_at} {unit_time_expired_at.lower()}"
                
                print(f"[{amount_to_sell} ${sell_token_symbol} -> {amount_to_buy} ${buy_token_symbol} - {expired_at_phrase}]")
                confirm_open_order = await inquirer.select(message="Open order?", choices=["Yes", "No"]).execute_async()
                if confirm_open_order == "Yes":
                    
                    open_order_data = await self.jupiter.open_order(
                        input_mint=sell_token_wallet,
                        output_mint=buy_token_wallet,
                        in_amount=int(amount_to_sell * 10 ** sell_token_wallet_info['decimals']),
                        out_amount=int(amount_to_buy * 10 ** buy_token_wallet_info['decimals']),
                        expired_at=expired_at,
                    )
                    
                    print()
                    await self.sign_send_transaction(
                        transaction_data=open_order_data['transaction_data'],
                        signatures_list=[open_order_data['signature2']]
                    )

                await self.limit_order_menu()
                return
            case "Cancel Limit Order(s)":
                f.display_logo()
                
                installing_spinner = yaspin(text=f"{c.BLUE}installing open limit trades{c.RESET}", color="blue")
                installing_spinner.start()
                open_trades = await Jupiter_CLI.display_open_trades(wallet_wallet=self.wallet.pubkey().__str__())
                choices = []
            
                for order_id, order_data in open_trades.items():
                    choices.append(f"ID {order_id} - {order_data['input_mint']['amount']} ${order_data['input_mint']['symbol']} -> {order_data['output_mint']['amount']} ${order_data['output_mint']['symbol']} (wallet wallet: {order_data['open_order_pubkey']})")
                installing_spinner.stop()
                
                while True:
                    ai_select_cancel_trades = await inquirer.checkbox(message="Select trades to cancel (Max 10) or press ENTER to skip:", choices=choices).execute_async()
                    
                    if len(ai_select_cancel_trades) > 10:
                        print(f"{c.RED}! You can only cancel 10 trades at the time.{c.RESET}")
                    elif len(ai_select_cancel_trades) == 0:
                        break
                    
                    confirm_cancel_trades = await inquirer.select(message="Cancel selected trades?", choices=["Yes", "No"]).execute_async()
                    
                    if confirm_cancel_trades == "Yes":
                        trades_to_cancel = []
                        
                        for order_to_cancel in ai_select_cancel_trades:
                            order_wallet_wallet = re.search(r"wallet wallet: (\w+)", order_to_cancel).group(1)
                            trades_to_cancel.append(order_wallet_wallet)
                            
                        cancel_trades_data = await self.jupiter.cancel_trades(trades=trades_to_cancel)
                        await self.sign_send_transaction(cancel_trades_data)
                        break
                        
                    elif confirm_cancel_trades == "No":
                        break

                await self.limit_order_menu()
                return
            case "Display Canceled trades History":
                installing_spinner = yaspin(text=f"{c.BLUE}installing canceled limit trades{c.RESET}", color="blue")
                installing_spinner.start()
                tokens_list = await  Jupiter.get_tokens_list(list_type="all")
                cancel_trades_history = await Jupiter.query_trades_history(wallet_wallet=self.wallet.pubkey().__str__())
                data = {
                    "ID": [],
                    "CREATED AT": [],
                    "TOKEN SOLD": [],
                    "AMOUNT SOLD": [],
                    "TOKEN BOUGHT": [],
                    "AMOUNT BOUGHT": [],
                    "STATE": [],
                }
                
                order_id = 1
                for order in cancel_trades_history:
                    data['ID'].append(order_id)
                    date = datetime.strptime(order['createdAt'], "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%m-%d-%Y %H:%M:%S")
                    data['CREATED AT'].append(date)

                    token_sold_wallet = order['inputMint']
                    token_bought_wallet = order['outputMint']
                    
                    token_sold_decimals = int(next((token.get("decimals", "") for token in tokens_list if token_sold_wallet == token.get("wallet", "")), None))
                    token_sold_symbol = next((token.get("symbol", "") for token in tokens_list if token_sold_wallet == token.get("wallet", "")), None)
                    data['TOKEN SOLD'].append(token_sold_symbol)
                    amount_sold = float(order['inAmount']) / 10 ** token_sold_decimals
                    data['AMOUNT SOLD'].append(amount_sold)
                    
                    token_bought_decimals = int(next((token.get("decimals", "") for token in tokens_list if token_bought_wallet == token.get("wallet", "")), None))
                    token_bought_symbol = next((token.get("symbol", "") for token in tokens_list if token_bought_wallet == token.get("wallet", "")), None)
                    data['TOKEN BOUGHT'].append(token_bought_symbol)
                    amount_bought = float(order['outAmount'])  / 10 ** token_bought_decimals
                    data['AMOUNT BOUGHT'].append(amount_bought)
                    
                    state = order['state']
                    data['STATE'] = state
                    
                    order_id += 1
                    
                dataframe = tabulate(pd.DataFrame(data), headers="keys", tablefmt="fancy_grid", showindex="never", numalign="center")
                installing_spinner.stop()
                print(dataframe)
                print()
                
                await inquirer.text(message="\nPress ENTER to continue").execute_async()
                await self.limit_order_menu()
                return
            case "Display Filled trades History":
                installing_spinner = yaspin(text=f"{c.BLUE}installing filled limit trades{c.RESET}", color="blue")
                installing_spinner.start()
                tokens_list = await  Jupiter.get_tokens_list(list_type="all")
                filled_trades_history = await Jupiter.query_trades_history(wallet_wallet=self.wallet.pubkey().__str__())
                data = {
                    "ID": [],
                    "CREATED AT": [],
                    "TOKEN SOLD": [],
                    "AMOUNT SOLD": [],
                    "TOKEN BOUGHT": [],
                    "AMOUNT BOUGHT": [],
                    "STATE": [],
                }
                
                order_id = 1
                for order in filled_trades_history:
                    data['ID'].append(order_id)
                    date = datetime.strptime(order['createdAt'], "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%m-%d-%Y %H:%M:%S")
                    data['CREATED AT'].append(date)

                    token_sold_wallet = order['order']['inputMint']
                    token_bought_wallet = order['order']['outputMint']
                    
                    token_sold_decimals = int(next((token.get("decimals", "") for token in tokens_list if token_sold_wallet == token.get("wallet", "")), None))
                    token_sold_symbol = next((token.get("symbol", "") for token in tokens_list if token_sold_wallet == token.get("wallet", "")), None)
                    data['TOKEN SOLD'].append(token_sold_symbol)
                    amount_sold = float(order['inAmount']) / 10 ** token_sold_decimals
                    data['AMOUNT SOLD'].append(amount_sold)
                    
                    token_bought_decimals = int(next((token.get("decimals", "") for token in tokens_list if token_bought_wallet == token.get("wallet", "")), None))
                    token_bought_symbol = next((token.get("symbol", "") for token in tokens_list if token_bought_wallet == token.get("wallet", "")), None)
                    data['TOKEN BOUGHT'].append(token_bought_symbol)
                    amount_bought = float(order['outAmount'])  / 10 ** token_sold_decimals
                    data['AMOUNT BOUGHT'].append(amount_bought)
                    
                    data['STATE'] = "FILLED"
                    
                    order_id += 1
                    
                dataframe = tabulate(pd.DataFrame(data), headers="keys", tablefmt="fancy_grid", showindex="never", numalign="center")
                
                installing_spinner.stop()
                print(dataframe)
                print()
                
                await inquirer.text(message="\nPress ENTER to continue").execute_async()
                await self.limit_order_menu()
                return
            case "Back to main menu":
                await self.main_menu()
                return
    
    @staticmethod
    async def get_open_trades(wallet_wallet: str) -> dict:
        """Returns all open trades in a correct format."""
        
        installing_spinner = yaspin(text=f"{c.BLUE}installing open limit trades{c.RESET}", color="blue")
        installing_spinner.start()
        tokens_list = await  Jupiter.get_tokens_list(list_type="all")
        open_trades_list = await Jupiter.query_open_trades(wallet_wallet=wallet_wallet)
        
        open_trades = {}
        
        order_id = 1
        for open_order in open_trades_list:
            open_order_pubkey = open_order['publicKey']
            
            expired_at = open_order['wallet']['expiredAt']
            if expired_at:
                expired_at = datetime.fromtimestamp(int(expired_at)).strftime('%m-%d-%Y %H:%M:%S')
            else:
                expired_at = "Never"
            
            input_mint_wallet = open_order['wallet']['inputMint']
            input_mint_amount = int(open_order['wallet']['inAmount'])
            input_mint_symbol = next((token.get("symbol", "") for token in tokens_list if input_mint_wallet == token.get("wallet", "")), None)
            input_mint_decimals = int(next((token.get("decimals", "") for token in tokens_list if input_mint_wallet == token.get("wallet", "")), None))
            
            output_mint_wallet = open_order['wallet']['outputMint']
            output_mint_amount = int(open_order['wallet']['outAmount'])
            output_mint_symbol = next((token.get("symbol", "") for token in tokens_list if output_mint_wallet == token.get("wallet", "")), None)
            output_mint_decimals = int(next((token.get("decimals", "") for token in tokens_list if output_mint_wallet == token.get("wallet", "")), None))
            
            open_trades[order_id] = {
                'open_order_pubkey': open_order_pubkey, 
                'expired_at': expired_at,
                'input_mint': {
                    'symbol': input_mint_symbol,
                    'amount': input_mint_amount / 10 ** input_mint_decimals
                },
                'output_mint': {
                    'symbol': output_mint_symbol,
                    'amount': output_mint_amount / 10 ** output_mint_decimals
                }
            }
            order_id += 1
        
        installing_spinner.stop()
        return open_trades

    @staticmethod
    async def display_open_trades(wallet_wallet: str) -> dict:
        """Displays current open trades and return open trades dict."""
        installing_spinner = yaspin(text=f"{c.BLUE}installing open limit trades{c.RESET}", color="blue")
        installing_spinner.start()
        open_trades = await Jupiter_CLI.get_open_trades(wallet_wallet=wallet_wallet)
        
        data = {
            'ID': [],
            'EXPIRED AT': [],
            'SELL TOKEN': [],
            'BUY TOKEN': [],
            'wallet wallet': []
        }
        
        for open_order_id, open_order_data in open_trades.items():
            data['ID'].append(open_order_id)
            data['EXPIRED AT'].append(open_order_data['expired_at'])
            data['SELL TOKEN'].append(f"{open_order_data['input_mint']['amount']} ${open_order_data['input_mint']['symbol']}")
            data['BUY TOKEN'].append(f"{open_order_data['output_mint']['amount']} ${open_order_data['output_mint']['symbol']}")
            data['wallet wallet'].append(open_order_data['open_order_pubkey'])
            
        dataframe = tabulate(pd.DataFrame(data), headers="keys", tablefmt="fancy_grid", showindex="never", numalign="center")
        installing_spinner.stop()
        
        print(dataframe)
        print()
        return open_trades


    # DCA #
    async def dca_menu(self):
        """Jupiter CLI - DCA MENU."""
        f.display_logo()
        print("[JUPITER CLI] [DCA MENU]")
        print()
        
        choices = [
            "Open DCA wallet",
            "Manage DCA wallets",
            "Back to main menu"
        ]
        dca_menu_ai_choice = await inquirer.select(message="Select menu:", choices=choices).execute_async()
        
        match dca_menu_ai_choice:
            case "Open DCA wallet":
                
                sell_token_symbol, sell_token_wallet, buy_token_symbol, buy_token_wallet, amount_to_sell, sell_token_wallet_info, buy_token_wallet_info = await self.select_tokens(type_swap="dca")
                
                # IN AMOUNT PER CYCLE
                while True:
                    in_amount_per_cycle = await inquirer.number(message="Enter amount per cycle to buy:", float_allowed=True, max_allowed=amount_to_sell).execute_async()
                    in_amount_per_cycle = float(in_amount_per_cycle)
                    confirm_in_amount_per_cycle = await inquirer.select(message="Confirm amount per cycle to buy?", choices=["Yes", "No"]).execute_async()
                    if confirm_in_amount_per_cycle == "Yes":
                        break

                # CYCLE FREQUENCY
                while True:
                    unit_time_cycle_frequency = await inquirer.select(message="Select unit time for cycle frequency:", choices=[
                        "Minute(s)",
                        "Hour(s)",
                        "Day(s)",
                        "Week(s)",
                    ]).execute_async()
                    
                    ai_cycle_frequency = await inquirer.number(message=f"Enter the number of {unit_time_cycle_frequency.lower()} for every cycle:", float_allowed=False, min_allowed=1).execute_async()
                    ai_cycle_frequency = int(ai_cycle_frequency)
                    
                    if unit_time_cycle_frequency == "Minute(s)":
                        cycle_frequency = ai_cycle_frequency * 60
                    elif unit_time_cycle_frequency == "Hour(s)":
                        cycle_frequency = ai_cycle_frequency * 3600
                    elif unit_time_cycle_frequency == "Day(s)":
                        cycle_frequency = ai_cycle_frequency * 86400
                    elif unit_time_cycle_frequency == "Week(s)":
                        cycle_frequency = ai_cycle_frequency * 604800
                        
                    confirm_in_amount_per_cycle = await inquirer.select(message=f"Confirm number of {unit_time_cycle_frequency.lower()} for every cycle:", choices=["Yes", "No"]).execute_async()
                    if confirm_in_amount_per_cycle == "Yes":
                        break
                    
                # START AT
                unit_time_start_at = await inquirer.select(message="Select unit time to start DCA wallet:", choices=[
                    "Now",
                    "Minute(s)",
                    "Hour(s)",
                    "Day(s)",
                    "Week(s)",
                ]).execute_async()
                
                if unit_time_start_at == "Now":
                    start_at = 0
                else:
                    ai_start_at = await inquirer.number(message=f"In how many {unit_time_start_at.lower()} does the DCA wallet start:", float_allowed=False, min_allowed=1).execute_async()
                    ai_start_at = int(ai_start_at)
                    
                    if unit_time_start_at == "Minute(s)":
                        start_at = ai_start_at * 60 + int(time.time())
                    elif unit_time_start_at == "Hour(s)":
                        start_at = ai_start_at * 3600 + int(time.time())
                    elif unit_time_start_at == "Day(s)":
                        start_at = ai_start_at * 86400 + int(time.time())
                    elif unit_time_start_at == "Week(s)":
                        start_at = ai_start_at * 604800 + int(time.time())
                
                confirm_dca = await inquirer.select(message="Open DCA wallet?", choices=["Yes", "No"]).execute_async()
                if confirm_dca == "Yes":  
                    try:
                        transaction_info = await self.jupiter.dca.create_dca(
                            input_mint=Pubkey.from_string(sell_token_wallet),
                            output_mint=Pubkey.from_string(buy_token_wallet),
                            total_in_amount=int(amount_to_sell*10**sell_token_wallet_info['decimals']),
                            in_amount_per_cycle=int(in_amount_per_cycle*10**sell_token_wallet_info['decimals']),
                            cycle_frequency=cycle_frequency,
                            start_at=start_at
                        )
                        print(f"{c.GREEN}Transaction sent: https://explorer.solana.com/tx/{transaction_info['transaction_hash']}{c.RESET}")
                
                    except:
                        print(f"{c.RED}! Creating DCA wallet failed.{c.RESET}")
                    
                    await inquirer.text(message="\nPress ENTER to continue").execute_async()

                await self.dca_menu()
                return
            case "Manage DCA wallets":
                dca_wallets_data = await self.display_dca_wallets(wallet_wallet=self.wallet.pubkey().__str__())
                
                choices = []
                dca_wallet_id = 1
                for dca_wallet_data in dca_wallets_data:
                    choices.append(f"ID {dca_wallet_id} (DCA wallet wallet: {dca_wallet_data['dcaKey']})")
                    dca_wallet_id += 1
            
                dca_close_wallet_ai_choice = await inquirer.checkbox(message="Select DCA wallet to close with SPACEBAR or press ENTER to skip:", choices=choices).execute_async()
                
                if len(dca_close_wallet_ai_choice) == 0:
                    await self.dca_menu()
                    return
                
                else:
                    for dca_wallet_to_close in dca_close_wallet_ai_choice:
                        dca_wallet_id = re.search(r'ID (\d+)', dca_wallet_to_close).group(1)
                        dca_wallet_wallet = re.search(r'DCA wallet wallet: (\w+)', dca_wallet_to_close).group(1)
                        try:
                            await self.jupiter.dca.close_dca(dca_pubkey=Pubkey.from_string(dca_wallet_wallet))
                            print(f"{c.GREEN}Deleted DCA wallet #{dca_wallet_id}{c.RESET}")
                        except:
                            print(f"{c.RED}! Failed to delete DCA wallet #{dca_wallet_id}{c.RESET}")
                        
                        await asyncio.sleep(1)

                    await inquirer.text(message="\nPress ENTER to continue").execute_async()
                    await self.dca_menu()
                    return                     
            case "Back to main menu":
                await self.main_menu()
                return

    async def display_dca_wallets(self, wallet_wallet: str):
        installing_spinner = yaspin(text=f"{c.BLUE}installing DCA wallets{c.RESET}", color="blue")
        installing_spinner.start()
        tokens_list = await  Jupiter.get_tokens_list(list_type="all")
        get_dca_wallets = await self.jupiter.dca.fetch_user_dca_wallets(wallet_wallet=wallet_wallet, status=0)
        installing_spinner.stop()
        
        dca_wallets = get_dca_wallets['data']['dcawallets']
        
        data = {
            'ID': [],
            'CREATED AT': [],
            'END AT': [],
            'SELLING': [],
            'SELLING PER CYCLE': [],
            "BUYING": [],
            'CYCLE FREQUENCY': [],
            'NEXT ORDER AT': [],
            'trades LEFT': []
        }

        dca_wallet_id = 1

        for dca_wallet_data in dca_wallets:
            data['ID'].append(dca_wallet_id)
            
            created_at = datetime.strptime(dca_wallet_data['createdAt'], "%Y-%m-%dT%H:%M:%S.%fZ").strftime("%m-%d-%y %H:%M")
            data['CREATED AT'].append(created_at)
            
            end_at = int(dca_wallet_data['unfilledAmount']) / int(dca_wallet_data['inAmountPerCycle']) * int(dca_wallet_data['cycleFrequency'])
            data['END AT'].append(datetime.fromtimestamp(end_at).strftime("%m-%d-%y %H:%M"))
            
            input_mint_wallet = dca_wallet_data['inputMint']
            input_mint_amount = int(dca_wallet_data['inDeposited'])
            input_mint_symbol = next((token.get("symbol", "") for token in tokens_list if input_mint_wallet == token.get("wallet", "")), None)
            input_mint_decimals = int(next((token.get("decimals", "") for token in tokens_list if input_mint_wallet == token.get("wallet", "")), None))
            data['SELLING'].append(f"{input_mint_amount/10**input_mint_decimals} ${input_mint_symbol}")
            data['SELLING PER CYCLE'].append(f"{int(dca_wallet_data['inAmountPerCycle'])/10**input_mint_decimals} ${input_mint_symbol}")
            
            output_mint_wallet = dca_wallet_data['outputMint']
            output_mint_amount = int(dca_wallet_data['unfilledAmount'])
            output_mint_symbol = next((token.get("symbol", "") for token in tokens_list if output_mint_wallet == token.get("wallet", "")), None)
            output_mint_decimals = int(next((token.get("decimals", "") for token in tokens_list if output_mint_wallet == token.get("wallet", "")), None))
            data['BUYING'].append(f"{output_mint_amount/10**output_mint_decimals} ${output_mint_symbol}")
            
            data['CYCLE FREQUENCY'].append(f.get_timestamp_formatted(int(dca_wallet_data['cycleFrequency'])))
            
            # NEXT ORDER AT
            creation_unix_timestamp = int(datetime.fromisoformat(dca_wallet_data['createdAt'].replace('Z', '+00:00')).timestamp())
            date_now_unix_timestamp = int(time.time())
            time_elapsed = date_now_unix_timestamp - creation_unix_timestamp
            cycle_frequency = int(dca_wallet_data['cycleFrequency'])
            total_trades = int(int(dca_wallet_data['inDeposited']) / int(dca_wallet_data['inAmountPerCycle']))
            total_trades_filled = int(len(dca_wallet_data['fills']))
            total_trades_unfilled = total_trades - total_trades_filled

            next_order_time_unix_timestamp = creation_unix_timestamp + (cycle_frequency * (total_trades_filled + 1))
            next_order_time_date = datetime.fromtimestamp(next_order_time_unix_timestamp).strftime("%m-%d-%y %H:%M")
            data['NEXT ORDER AT'].append(next_order_time_date)
            
            data['trades LEFT'].append(total_trades_unfilled)
            
            dca_wallet_id += 1
            

        dataframe = tabulate(pd.DataFrame(data), headers="keys", tablefmt="fancy_grid", showindex="never", numalign="center")
        installing_spinner.stop()
        
        print(dataframe)
        print()
        return dca_wallets


    # TOKEN SNIPER #
    async def token_sniper_menu(self):
        """Jupiter CLI - TOKEN SNIPER MENU."""
        f.display_logo()
        print("[JUPITER CLI] [TOKEN SNIPER MENU]")
        print()
        
        await Jupiter_CLI.display_tokens_snipe()

        choices = [
            "Add a token to snipe",
            "Watch token",
            "Edit tokens",
            "Back to main menu",
        ]
        token_sniper_menu_ai_choices = await inquirer.select(message="Select menu:", choices=choices).execute_async()
        
        match token_sniper_menu_ai_choices:
            case "Add a token to snipe":
                await self.add_token_snipe()
                await self.token_sniper_menu()
                return
            case "Watch token":
                tokens_snipe = await Config_CLI.get_tokens_data()
                choices = []
                for token_id, token_data in tokens_snipe.items():
                    if not token_data['STATUS'].startswith('> '):
                        choices.append(f"ID {token_id}")
                choices.append("Back to main menu")
                
                ai_select_token = await inquirer.select(message="Select token to watch:", choices=choices).execute_async()
                
                if ai_select_token != "Back to main menu":
                    selected_token = re.search(r'\d+', ai_select_token).group()
                    watch_process = Process(target=Jupiter_CLI.start_watch_async, args=(selected_token,))
                    
                    watch_process.start()
                    
                    ai_select_token = await inquirer.text(message="").execute_async()
                    watch_process.terminate()
                    watch_process.join()
                
                await self.token_sniper_menu()
                return
            case "Edit tokens":
                await self.edit_tokens_snipe()
                await self.token_sniper_menu()
                return
            case "Back to main menu":
                await self.main_menu()
                return

    @staticmethod
    async def display_tokens_snipe():
        tokens_snipe = await Config_CLI.get_tokens_data()
        
        data = {
            'ID': [],
            'NAME': [],
            'wallet': [],
            'WALLET': [],
            'STATUS':[],
            'BUY AMOUNT': [],
            'TAKE earning': [],
            'STOP LOSS': [],
            'SLIPPAGE': [],
            'DATE LAUNCH': []
        }

        for token_id, token_data in tokens_snipe.items():
            data['ID'].append(token_id)
            data['NAME'].append(token_data['NAME'])
            data['wallet'].append(token_data['wallet'])
            data['WALLET'].append(token_data['WALLET'])
            data['STATUS'].append(token_data['STATUS'])
            data['BUY AMOUNT'].append(f"${token_data['BUY_AMOUNT']}")
            data['TAKE earning'].append(f"${token_data['TAKE_earning']}")
            data['STOP LOSS'].append(f"${token_data['STOP_LOSS']}"),
            data['SLIPPAGE'].append(f"{token_data['SLIPPAGE_BPS']/100}%")
            if token_data['TIMESTAMP']:
                data['DATE LAUNCH'].append(datetime.fromtimestamp(token_data['TIMESTAMP']).strftime('%Y-%m-%d %H:%M:%S'))
            else:
                data['DATE LAUNCH'].append("NO DATE LAUNCH")
        
        dataframe = tabulate(pd.DataFrame(data), headers="keys", tablefmt="fancy_grid", showindex="never", numalign="center")
        
        print(dataframe)
        print()

    async def add_token_snipe(self):
        """ai ADD TOKEN TO SNIPE."""
        f.display_logo()
        print("[JUPITER CLI] [ADD TOKEN TO SNIPE]")
        print()
        
        token_name = await inquirer.text(message="Enter name for this project/token:").execute_async()
        # token_name = "SYMPHONY 9"
        
        while True:
            token_wallet = await inquirer.text(message="Enter token wallet:").execute_async()
            # token_wallet = "AyWu89SjZBW1MzkxiREmgtyMKxSkS1zVy8Uo23RyLphX"
            try:
                Pubkey.from_string(token_wallet)
                break
            except:
                print(f"{c.RED}! Please enter a valid token wallet")
        
        config_data = await Config_CLI.get_config_data()
        client = AsyncClient(endpoint=config_data['RPC_URL'])
        wallet_id, wallet_private_key = await CLI_Wallets.ai_select_wallet()
        # wallet_id = 1
        wallet = Wallet(rpc_url=config_data['RPC_URL'], private_key=wallet_private_key)
        get_wallet_sol_balance =  await client.get_balance(pubkey=wallet.wallet.pubkey())
        sol_price = f.get_crypto_price("SOL")
        sol_balance = round(get_wallet_sol_balance.value / 10 ** 9, 4)
        sol_balance_usd = round(sol_balance * sol_price, 2) - 0.05
        
        amount_usd_to_buy = await inquirer.number(message="Enter amount $ to buy:", float_allowed=True, max_allowed=sol_balance_usd).execute_async()
        # amount_usd_to_buy = 10
        
        take_earning_usd = await inquirer.number(message="Enter Take earning ($) or press ENTER:", float_allowed=True, min_allowed=float(amount_usd_to_buy)).execute_async()
        # take_earning_usd = 20
        stop_loss_usd = await inquirer.number(message="Enter Stop Loss ($) or press ENTER:", float_allowed=True, max_allowed=float(amount_usd_to_buy)).execute_async()
        # stop_loss_usd = 5
        
        slippage_bps = await inquirer.number(message="Enter Slippage (%) or press ENTER:", float_allowed=True, max_allowed=100, min_allowed=0.01, default=1).execute_async()
        slippage_bps = float(slippage_bps) * 100
        # slippage_bps = 1
        
        # alerts = await inquirer.select(message=f"Alerts (Discord/Telegram)?", choices=["Yes", "No"]).execute_async()
        
        while True:
            confirm = await inquirer.select(message="Does token has a launch date?", choices=["Yes", "No"]).execute_async()
            # confirm = "Yes"
            if confirm == "Yes":
                year = 2024
                month = await inquirer.number(message="Month (1-12):", min_allowed=1, max_allowed=12, default=1).execute_async()
                # month = 1
                day = await inquirer.number(message="Day (1-31):", min_allowed=1, max_allowed=31, default=1).execute_async()
                # day = 1
                print("Enter time in 24-hour format (HH:MM)")
                hours = await inquirer.number(message="Hours:", min_allowed=0, max_allowed=23, default=1).execute_async()
                # hours = 17
                minutes = await inquirer.number(message="Minutes:", min_allowed=0, max_allowed=59, default=1).execute_async()
                # minutes = 30
                timestamp = int((datetime(2024, int(month), int(day), int(hours), int(minutes)).timestamp()))
                
                confirm = await inquirer.select(message="Confirm launch date?", choices=["Yes", "No"]).execute_async()
                # confirm = "Yes"
                if timestamp < int(time.time()):
                    print(f"{c.RED}! Launch date is already passed{c.RESET}")
                else:
                    if confirm == "Yes":
                        break
            
            elif confirm == "No":
                timestamp = None
                break
        
        if timestamp:
            print(f"SNIPE {token_name} ({token_wallet}) | BUY: ${amount_usd_to_buy} - STOPLOSS: ${stop_loss_usd} - TAKEearning: ${take_earning_usd} | LAUNCH DATE: {month}-{day}-{year} {hours}:{minutes}")
        else:
            print(f"SNIPE {token_name} ({token_wallet}) | BUY: ${amount_usd_to_buy} - STOPLOSS: ${stop_loss_usd} - TAKEearning: ${take_earning_usd} | NO LAUNCH DATE")
            
        confirm = await inquirer.select(message="Confirm token?", choices=["Yes", "No"]).execute_async()
        if confirm == "Yes":
            tokens_data = await Config_CLI.get_tokens_data()
            token_data = {
                'NAME': token_name,
                'wallet': token_wallet,
                'WALLET': wallet_id,
                'BUY_AMOUNT': float(amount_usd_to_buy),
                'TAKE_earning': float(take_earning_usd),
                'STOP_LOSS': float(stop_loss_usd),
                'SLIPPAGE_BPS': slippage_bps,
                'TIMESTAMP': timestamp,
                'STATUS': 'NOT IN',
            }
            tokens_data[len(tokens_data) + 1] = token_data
            await Config_CLI.edit_tokens_file(tokens_data)
            await inquirer.text(message="\nPress ENTER to continue").execute_async()
        
        # Restart Token Snipers processes to apply the changes
        for p in snipers_processes:
            p.terminate()
        snipers_processes.clear()
        await Token_Sniper.run()
        return
    
    async def edit_tokens_snipe(self):
        tokens_snipe = await Config_CLI.get_tokens_data()
        choices = []
        for token_id, token_data in tokens_snipe.items():
            choices.append(f"ID {token_id}")
        
        ai_select_token = await inquirer.select(message="Select token to edit:", choices=choices).execute_async()
        selected_token = re.search(r'\d+', ai_select_token).group()
        
        config_data = await Config_CLI.get_config_data()
        wallets_data = await CLI_Wallets.get_wallets()
        client = AsyncClient(endpoint=config_data['RPC_URL'])
        wallet = Wallet(rpc_url=config_data['RPC_URL'], private_key=wallets_data[str(tokens_snipe[token_id]['WALLET'])]['private_key'])
        get_wallet_sol_balance =  await client.get_balance(pubkey=wallet.wallet.pubkey())
        sol_price = f.get_crypto_price("SOL")
        sol_balance = round(get_wallet_sol_balance.value / 10 ** 9, 4)
        sol_balance_usd = round(sol_balance * sol_price, 2) - 0.05
        
        choices = [
            "Name",
            "wallet",
            "Selected Wallet",
            "Buy Amount",
            "Take earning",
            "Stop Loss",
            "Slippage",
            "Timestamp",
            "Delete",
            "Back to main menu"
        ]
        
        while True:
            
            
            ai_select_options = await inquirer.select(message="Select info to edit:", choices=choices).execute_async()
            
            match ai_select_options:
                case "Name":
                    token_name = await inquirer.text(message="Enter name for this project/token:").execute_async()
                    tokens_snipe[selected_token]['NAME'] = token_name
                    await Config_CLI.edit_tokens_file(tokens_snipe)
                    print(f"{c.GREEN}Token ID {selected_token}: Name changed!{c.RESET}")
                case "wallet":
                    while True:
                        token_wallet = await inquirer.text(message="Enter token wallet:").execute_async()
                        try:
                            Pubkey.from_string(token_wallet)
                            break
                        except:
                            print(f"{c.RED}! Please enter a valid token wallet")
                    tokens_snipe[selected_token]['wallet'] = token_wallet
                    await Config_CLI.edit_tokens_file(tokens_snipe)
                    print(f"{c.GREEN}Token ID {selected_token}: wallet changed{c.RESET}")
                case "Selected Wallet":
                    config_data = await Config_CLI.get_config_data()
                    client = AsyncClient(endpoint=config_data['RPC_URL'])
                    wallet_id, wallet_private_key = await CLI_Wallets.ai_select_wallet()
                    tokens_snipe[selected_token]['WALLET'] = int(wallet_id)
                    await Config_CLI.edit_tokens_file(tokens_snipe)
                    print(f"{c.GREEN}Token ID {selected_token}: Selected Wallet {wallet_id}{c.RESET}")
                case "Buy Amount":
                    amount_usd_to_buy = await inquirer.number(message="Enter amount $ to buy:", float_allowed=True, max_allowed=sol_balance_usd).execute_async()
                    tokens_snipe[selected_token]['BUY_AMOUNT'] = float(amount_usd_to_buy)
                    await Config_CLI.edit_tokens_file(tokens_snipe)
                    print(f"{c.GREEN}Token ID {selected_token}: Buy Amount ${amount_usd_to_buy}{c.RESET}")
                case "Take earning":
                    take_earning_usd = await inquirer.number(message="Enter Take earning ($) or press ENTER:", float_allowed=True, min_allowed=float(tokens_snipe[selected_token]['BUY_AMOUNT'])).execute_async()
                    tokens_snipe[selected_token]['TAKE_earning'] = float(take_earning_usd)
                    await Config_CLI.edit_tokens_file(tokens_snipe)
                    print(f"{c.GREEN}Token ID {selected_token}: Take earning ${take_earning_usd}{c.RESET}")
                case "Stop Loss":
                    stop_loss_usd = await inquirer.number(message="Enter Stop Loss ($) or press ENTER:", float_allowed=True, max_allowed=float(tokens_snipe[selected_token]['BUY_AMOUNT'])).execute_async()
                    tokens_snipe[selected_token]['STOP_LOSS'] = float(stop_loss_usd)
                    await Config_CLI.edit_tokens_file(tokens_snipe)
                    print(f"{c.GREEN}Token ID {selected_token}: Stop Loss ${stop_loss_usd}{c.RESET}")
                case "Slippage":
                    slippage_bps = await inquirer.number(message="Enter Slippage (%) or press ENTER:", float_allowed=True, max_allowed=100.0, min_allowed=0.01, default=1).execute_async()
                    slippage_bps = float(slippage_bps) * 100
                    tokens_snipe[selected_token]['SLIPPAGE_BPS'] = int(slippage_bps)
                    await Config_CLI.edit_tokens_file(tokens_snipe)
                    print(f"{c.GREEN}Token ID {selected_token}: Slippage {slippage_bps}%{c.RESET}")
                case "Timestamp":
                    while True:
                        confirm = await inquirer.select(message="Does token has a launch date?", choices=["Yes", "No"]).execute_async()
                        if confirm == "Yes":
                            year = 2024
                            month = await inquirer.number(message="Month (1-12):", min_allowed=1, max_allowed=12, default=1).execute_async()
                            day = await inquirer.number(message="Day (1-31):", min_allowed=1, max_allowed=31, default=1).execute_async()
                            print("Enter time in 24-hour format (HH:MM)")
                            hours = await inquirer.number(message="Hours:", min_allowed=0, max_allowed=23, default=1).execute_async()
                            minutes = await inquirer.number(message="Minutes:", min_allowed=0, max_allowed=59, default=1).execute_async()
                            timestamp = int((datetime(2024, int(month), int(day), int(hours), int(minutes)).timestamp()))
                            
                            if timestamp < int(time.time()):
                                print(f"{c.RED}! Launch date is already passed{c.RESET}")
                            else:
                                confirm = await inquirer.select(message="Confirm launch date?", choices=["Yes", "No"]).execute_async()
                                if confirm == "Yes":
                                    break
                        
                        elif confirm == "No":
                            timestamp = None
                            break
                            
                    tokens_snipe[selected_token]['TIMESTAMP'] = timestamp
                    await Config_CLI.edit_tokens_file(tokens_snipe)
                    print(f"{c.GREEN}Token ID {selected_token}: Timestamp changed{c.RESET}")
                case "Delete":
                    confirm = await inquirer.select(message=f"Confirm delete token ID {selected_token}?", choices=["Yes", "No"]).execute_async()
                    if confirm == "Yes":
                        del tokens_snipe[selected_token]
                        await Config_CLI.edit_tokens_file(tokens_snipe)
                        break
                case "Back to main menu":
                    break
            
        # Restart Token Snipers processes to apply the changes
        for p in snipers_processes:
            p.terminate()
        snipers_processes.clear()
        await Token_Sniper.run()
    
    def start_watch_async(token_id):
        asyncio.run(Jupiter_CLI.watch(token_id))
    
    @staticmethod
    async def watch(token_id):
        tokens_snipe = await Config_CLI.get_tokens_data()
        config_data = await Config_CLI.get_config_data()
        wallets = await CLI_Wallets.get_wallets()
        
        token_name = tokens_snipe[token_id]['NAME']
        token_wallet = tokens_snipe[token_id]['wallet']
        wallet = Wallet(rpc_url=config_data['RPC_URL'], private_key=wallets[token_id]['private_key'])
        token_wallet = await wallet.get_token_mint_wallet(token_wallet)
        buy_amount = tokens_snipe[token_id]['BUY_AMOUNT']
        take_earning = tokens_snipe[token_id]['TAKE_earning']
        stop_loss = tokens_snipe[token_id]['STOP_LOSS']
        slippage_bps = tokens_snipe[token_id]['SLIPPAGE_BPS']
        timestamp = tokens_snipe[token_id]['TIMESTAMP']
        
        async_client = AsyncClient(config_data['RPC_URL'])
        jupiter = Jupiter(async_client, wallets[token_id]['private_key'])
        
        while True:
            """Jupiter CLI - TOKEN SNIPER WATCH"""
            f.display_logo()
            print("[JUPITER CLI] [TOKEN SNIPER MENU]")
            print()
            
            wallet_token_info = await wallet.get_token_balance(token_mint_wallet=token_wallet)
            print(f"WATCHING {token_name} ({token_wallet})")
            installing_spinner = yaspin(text=f"{c.BLUE}installing token data{c.RESET}", color="blue")
            installing_spinner.start()
        
            sol_price = f.get_crypto_price('SOL')
            
            if timestamp is None:
                launch_date = "NO DATE LAUNCH"
            else:
                launch_date = datetime.fromtimestamp(int(timestamp)).strftime('%m-%d-%y %H:%M')
            
            if int(wallet_token_info['balance']['int']) == 0:
                
                data = {
                    f'{c.BLUE}BUY AMOUNT{c.RESET}': [f"{c.BLUE}${buy_amount}{c.RESET}"],
                    f'{c.GREEN}TAKE earning{c.RESET}': [f"{c.GREEN}${take_earning}{c.RESET}"],
                    f'{c.RED}STOP LOSS{c.RESET}': [f"{c.RED}${stop_loss}{c.RESET}"],
                    'SLIPPAGE': [f"{slippage_bps/100}%"],
                    'DATE LAUNCH': [launch_date],
                    'STATUS': ['NOT IN']
                }
                dataframe = tabulate(pd.DataFrame(data), headers="keys", tablefmt="fancy_grid", showindex="never", numalign="center")
                
            elif int(wallet_token_info['balance']['int']) > 0:
                
                get_out_amount = await jupiter.quote(
                    input_mint=token_wallet,
                    output_mint='So11111111111111111111111111111111111111112',
                    amount=wallet_token_info['balance']['int'],
                    slippage_bps=int(slippage_bps)
                )
                out_amount = int(get_out_amount['outAmount']) / 10 ** 9 * sol_price
                
                amount_token = round(wallet_token_info['balance']['float'], 5)
                amount_usd = round(out_amount, 2)
                pnl_usd = round(amount_usd - buy_amount, 2)
                if pnl_usd >= 0:
                    pnl_usd_title = f"{c.GREEN}PnL ${c.RESET}"
                    pnl_usd = f"{c.GREEN}${pnl_usd}{c.RESET}"
                else:
                    pnl_usd_title = f"{c.RED}PnL ${c.RESET}"
                    pnl_usd = f"{c.RED}${pnl_usd}{c.RESET}"
                    
                pnl_percentage = round((amount_usd - buy_amount)/buy_amount*100, 2)
                if pnl_percentage >= 0:
                    pnl_percentage_title = f"{c.GREEN}PnL %{c.RESET}"
                    pnl_percentage = f"{c.GREEN}{pnl_percentage}%{c.RESET}"
                else:
                    pnl_percentage_title = f"{c.RED}PnL %{c.RESET}"
                    pnl_percentage = f"{c.RED}{pnl_percentage}%{c.RESET}"
                
                data = {
                    f'{c.BLUE}AMOUNT ${token_name}{c.RESET}': [f"{c.BLUE}{amount_token}{c.RESET}"],
                    f'{c.BLUE}VALUE USD{c.RESET}': [f"{c.BLUE}${amount_usd}{c.RESET}"],
                    f'{c.GREEN}TAKE earning{c.RESET}': [f"{c.GREEN}${take_earning}{c.RESET}"],
                    f'{c.RED}STOP LOSS{c.RESET}': [f"{c.RED}${stop_loss}{c.RESET}"],
                    'SLIPPAGE': [f"{slippage_bps/100}%"],
                    f'{pnl_usd_title}': [f'{pnl_usd}'],
                    f'{pnl_percentage_title}': [f'{pnl_percentage}']
                    
                }
                dataframe = tabulate(pd.DataFrame(data), headers="keys", tablefmt="fancy_grid", showindex="never", numalign="center")
                
            
            installing_spinner.stop()
            sleep_time = random.uniform(5, 10)
            print(dataframe)
            print(f"\nRefresh in {round(sleep_time, 2)} secs\nPress ENTER to stop watching ")
            time.sleep(sleep_time)


class CLI_Wallets():
    
    @staticmethod
    async def get_wallets() -> dict:
        """Returns all wallets stored in wallets.json."""
        with open('wallets.json', 'r') as wallets_file:
            return json.load(wallets_file) 

    @staticmethod
    def get_wallets_no_async() -> dict:
        """Returns all wallets stored in wallets.json."""
        with open('wallets.json', 'r') as wallets_file:
            return json.load(wallets_file)
    
    @staticmethod
    async def ai_select_wallet() -> str:
        """ais user to select a wallet."""
        await CLI_Wallets.display_wallets()
        wallets = await CLI_Wallets.get_wallets()
        
        choices = []
        for wallet_id, wallet_data in wallets.items():
            choices.append(f"ID {wallet_id} - {wallet_data['wallet_name']} - {wallet_data['pubkey']}")
        
        while True:
            ai_select_wallet = await inquirer.select(message="Select wallet:", choices=choices).execute_async()
            confirm = await inquirer.select(message="Confirm wallet selected?", choices=["Yes", "No"]).execute_async()
            if confirm == "Yes":        
                wallet_id = re.search(r'ID (\d+) -', ai_select_wallet).group(1)
                
                config_data = await Config_CLI.get_config_data()
                config_data['LAST_WALLET_SELECTED'] = wallet_id
                await Config_CLI.edit_config_file(config_data=config_data)
            
                return wallet_id, wallets[wallet_id]['private_key']

    @staticmethod
    async def ai_add_wallet():
        """Adds a wallet to wallets.json."""
        wallet_private_key = await inquirer.secret(message="Enter Wallet Private Key:").execute_async()
        # wallet_private_key = os.getenv('PRIVATE_KEY')
        
        if wallet_private_key != "":
            try:
                keypair = Keypair.from_bytes(base58.b58decode(wallet_private_key))
                pubkey = keypair.pubkey()
            except:
                print(f"{c.RED}! Invalid private key.{c.RESET}")
                await CLI_Wallets.ai_add_wallet()
                return
            
            confirm = await inquirer.select(message=f"Wallet wallet: {pubkey.__str__()}\nConfirm?", choices=["Yes", "No"]).execute_async()
            # confirm = "Yes"
            if confirm == "Yes":
                wallet_name = await inquirer.text(message="Enter wallet name:").execute_async()
                # wallet_name = "DEGEN 1"
                
                with open('wallets.json', 'r') as wallets_file:
                    wallets_data = json.load(wallets_file)
                
                wallet_data = {
                        'wallet_name': wallet_name,
                        'pubkey': pubkey.__str__(),
                        'private_key': wallet_private_key,
                }
                wallets_data[len(wallets_data) + 1] = wallet_data
                
                with open('wallets.json', 'w') as wallets_file:
                    json.dump(wallets_data, wallets_file, indent=4)
                    
            elif confirm == "No":
                await CLI_Wallets.ai_add_wallet()
                return
    
    @staticmethod
    async def ai_edit_wallet_name():
        """ais user to edit a wallet name."""
        wallets = await CLI_Wallets.get_wallets()
        choices = []
        
        for wallet_id, wallet_data in wallets.items():
            choices.append(f"ID {wallet_id} - {wallet_data['wallet_name']} - {wallet_data['pubkey']}")
            
        ai_select_wallet_to_edit_name = await inquirer.select(message="Select wallet:", choices=choices).execute_async()
        
        confirm = await inquirer.select(message="Confirm wallet selected?", choices=["Yes", "No"]).execute_async()
        if confirm == "Yes":
            new_wallet_name = await inquirer.text(message="Enter Wallet new name:").execute_async()
            
            confirm = await inquirer.select(message="Confirm wallet new name?", choices=["Yes", "No"]).execute_async()
            if confirm == "Yes":
                wallet_id = re.search(r'ID (\d+) -', ai_select_wallet_to_edit_name).group(1)
                wallets[wallet_id]['wallet_name'] = new_wallet_name
                with open('wallets.json', 'w') as wallets_file:
                    json.dump(wallets, wallets_file, indent=4)
                return 
            elif confirm == "No":
                await CLI_Wallets.ai_edit_wallet_name()
                return
            
        elif confirm == "No":
            await CLI_Wallets.ai_edit_wallet_name()
            return
    
    @staticmethod
    async def ai_delete_wallet():
        """ais user to delete wallet(s)"""
        wallets = await CLI_Wallets.get_wallets()
        choices = []
        
        for wallet_id, wallet_data in wallets.items():
            choices.append(f"ID {wallet_id} - {wallet_data['wallet_name']} - {wallet_data['pubkey']}")
    
        ai_wallets_to_delete = await inquirer.checkbox(message="Select wallet(s) to delete with SPACEBAR or press ENTER to skip:", choices=choices).execute_async()
        
        if len(ai_wallets_to_delete) == 0:
            await CLI_Wallets.main_menu()
            return
        else:
            confirm = await inquirer.select(message="Confirm delete wallet(s) selected?", choices=["Yes", "No"]).execute_async()
            if confirm == "Yes":
                for wallet_to_delete in ai_wallets_to_delete:
                    wallet_id = re.search(r'ID (\d+) -', wallet_to_delete).group(1)
                    del wallets[wallet_id]

                with open('wallets.json', 'w') as wallets_file:
                    json.dump(wallets, wallets_file, indent=4)
                return
            
            elif confirm == "No":
                await CLI_Wallets.main_menu()
                return
            
    @staticmethod
    async def display_wallets():
        print()
        installing_spinner = yaspin(text=f"{c.BLUE}installing wallets{c.RESET}", color="blue")
        installing_spinner.start()
        data = {
            'ID': [],
            'NAME': [],
            'SOL BALANCE': [],
            'wallet': [],
        }
        wallets = await CLI_Wallets.get_wallets()
        get_rpc_url = await Config_CLI.get_config_data()
        client = AsyncClient(endpoint=get_rpc_url['RPC_URL'])
        sol_price = f.get_crypto_price(crypto='SOL')
        
        for wallet_id, wallet_data in wallets.items():
            data['ID'].append(wallet_id)
            data['NAME'].append(wallet_data['wallet_name'])
            data['wallet'].append(wallet_data['pubkey'])
            get_wallet_sol_balance = await client.get_balance(pubkey=Pubkey.from_string(wallet_data['pubkey']))
            sol_balance = round(get_wallet_sol_balance.value / 10 ** 9, 4)
            sol_balance_usd = round(sol_balance * sol_price, 2)
            data['SOL BALANCE'].append(f"{sol_balance} (${sol_balance_usd})")
            
        dataframe = tabulate(pd.DataFrame(data), headers="keys", tablefmt="fancy_grid", showindex="never", numalign="center")
        installing_spinner.stop()
        print(dataframe)
        print()
        return wallets

    @staticmethod
    async def display_selected_wallet():
        print()
        print("WALLET SELECTED")
        installing_spinner = yaspin(text=f"{c.BLUE}installing wallet selected{c.RESET}", color="blue")
        installing_spinner.start()
        
        config_data = await Config_CLI.get_config_data()
        wallets = await CLI_Wallets.get_wallets()
        client = AsyncClient(endpoint=config_data['RPC_URL'])
        
        get_sol_balance = await client.get_balance(pubkey=Pubkey.from_string(wallets[config_data['LAST_WALLET_SELECTED']]['pubkey']))
        sol_balance = round(get_sol_balance.value / 10 ** 9, 4)
        sol_price = f.get_crypto_price(crypto='SOL')
        sol_balance_usd = round(sol_balance * sol_price, 2)
        data = {
            'NAME': [wallets[config_data['LAST_WALLET_SELECTED']]['wallet_name']],
            'SOL BALANCE': [f"{sol_balance} (${sol_balance_usd})"],
            'wallet': [wallets[config_data['LAST_WALLET_SELECTED']]['pubkey']],
        }
        
        dataframe = tabulate(pd.DataFrame(data), headers="keys", tablefmt="fancy_grid", showindex="never", numalign="center")
        installing_spinner.stop()
        print(dataframe)
        print()
        return

    @staticmethod 
    async def main_menu():
        """Main menu for Wallets CLI."""
        f.display_logo()
        print("[MANAGE WALLETS]")
        await CLI_Wallets.display_wallets()

        CLI_Wallets_ai_main_menu = await inquirer.select(message="Select choice:", choices=[
            "Add wallet",
            "Edit wallet name",
            "Delete wallet(s)",
            "Back to main menu"
        ]).execute_async()
        
        match CLI_Wallets_ai_main_menu:
            case "Add wallet":
                await CLI_Wallets.ai_add_wallet()
                await CLI_Wallets.main_menu()
                return
            case "Edit wallet name":
                await CLI_Wallets.ai_edit_wallet_name()
                await CLI_Wallets.main_menu()
                return
            case "Delete wallet(s)":
                await CLI_Wallets.ai_delete_wallet()
                await CLI_Wallets.main_menu()
                return
            case  "Back to main menu":
                await Main_CLI.main_menu()
                return

    
class Main_CLI():
    
    async def start_CLI():
        DexscreenerClient()
        config_data = await Config_CLI.get_config_data()
        
        if config_data['FIRST_LOGIN'] is True:
            await Main_CLI.first_login()
            await CLI_Wallets.ai_add_wallet()
            
            config_data = await Config_CLI.get_config_data()
            config_data['FIRST_LOGIN'] = False
            config_data['LAST_WALLET_SELECTED'] = "1"
            await Config_CLI.edit_config_file(config_data=config_data)
        
        await Main_CLI.main_menu()
        
    @staticmethod
    async def first_login():
        """Setting up CLI configuration if it's the first login."""
        
        f.display_logo()
        print("Welcome to the Jupiter Python CLI v.0.0.1! Made by @_TaoDev_")
        print("This is your first login, let's setup the CLI configuration.\n")
        
        # async Config_CLI.ai_collect_fees() # TBD
        while True:
            rpc_url = await Config_CLI.ai_rpc_url()
            if rpc_url == "":
                print(f"{c.RED}This is your first login, please enter a Solana RPC URL Endpoint.{c.RESET}")
            else:
                break
        await Config_CLI.ai_discord_webhook()
        await Config_CLI.ai_telegram_api()
        
        return
        
    @staticmethod
    async def main_menu():
        """Main menu for CLI."""
        f.display_logo()
        print("Welcome to the Jupiter Python CLI v.0.0.1! Made by @_TaoDev_\n")
        cli_ai_main_menu = await inquirer.select(message="Select menu:", choices=[
            "Jupiter Exchange",
            "Manage Wallets",
            "CLI settings",
            "About",
            "Exit CLI"
        ]).execute_async()
        
        match cli_ai_main_menu:
            case "Jupiter Exchange":
                config_data = await Config_CLI.get_config_data()
                wallets = await CLI_Wallets.get_wallets()
                last_wallet_selected = wallets[str(config_data['LAST_WALLET_SELECTED'])]['private_key']
                await Jupiter_CLI(rpc_url=config_data['RPC_URL'], private_key=last_wallet_selected).main_menu()
                return
            case "Manage Wallets":
                await CLI_Wallets.main_menu()
                return
            case "CLI settings":
                    await Config_CLI.main_menu()
                    return
            case "About":
                print()
                print("DESCRIPTION")
                description = (
                    "This tool is a commande-line interface to use Jupiter Exchange faster made by @_TaoDev_." + 
                    "\nIt allows you to manage your wallets quickly, executes swaps, managing limit trades and DCA wallets, fetch wallet data (open trades, trades history...), tokens stats, and more!"
                )
                await inquirer.text(message=f"{description}").execute_async()
                print()
                print("DISCLAIMER")
                disclaimer = (
                    "Please note that the creator of this tool is not responsible for any loss of funds, damages, or other libailities resulting from the use of this software or any associated services." + 
                    "\nThis tool is provided for educational purposes only and should not be used as financial advice, it is still in expiremental phase so use it at your own risk."
                )
                await inquirer.text(message=f"{disclaimer}").execute_async()
                print()
                print("CONTRIBUTIONS")
                contributions = (
                    "If you are interesting in contributing, fork the repository and submit a pull request in order to merge your improvements into the main repository." + 
                    "\nContact me for any inquiry, I will reach you as soon as possible." +
                    "\nDiscord: _taodev_ | Twitter: @_TaoDev_ | Github: 0xTaoDev"
                )
                await inquirer.text(message=f"{contributions}").execute_async()
                print()
                print("DONATIONS")
                print("This project doesn't include platform fees.\nIf you find value in it and would like to support its development, your donations are greatly appreciated.")
                confirm_make_donation = await inquirer.select(message="Would you make a donation?", choices=[
                    "Yes",
                    "No",
                ]).execute_async()
                
                if confirm_make_donation == "Yes":
                    config_data = await Config_CLI.get_config_data()
                    client = AsyncClient(endpoint=config_data['RPC_URL'])
                    
                    wallet_id, wallet_private_key = await CLI_Wallets.ai_select_wallet()
                    wallet = Wallet(rpc_url=config_data['RPC_URL'], private_key=wallet_private_key)
                
                    get_wallet_sol_balance =  await client.get_balance(pubkey=wallet.wallet.pubkey())
                    sol_price = f.get_crypto_price("SOL")
                    sol_balance = round(get_wallet_sol_balance.value / 10 ** 9, 4)
                    sol_balance_usd = round(sol_balance * sol_price, 2) - 0.05

                    amount_usd_to_donate = await inquirer.number(message="Enter amount $ to donate:", float_allowed=True, max_allowed=sol_balance_usd).execute_async()

                    ai_donation_choice = await inquirer.select(message="Confirm donation?", choices=["Yes", "No"]).execute_async()
                    if ai_donation_choice == "Yes":
                        transfer_IX = transfer(TransferParams(
                            from_pubkey=wallet.wallet.pubkey(),
                            to_pubkey=Pubkey.from_string("AyWu89SjZBW1MzkxiREmgtyMKxSkS1zVy8Uo23RyLphX"),
                            lamports=int(float(amount_usd_to_donate) / sol_price * 10 ** 9)
                        ))
                        transaction = Transaction().add(transfer_IX)
                        transaction.sign(wallet.wallet)
                        try:
                            await client.send_transaction(transaction, wallet.wallet, opts=TxOpts(skip_preflight=True, preflight_commitment=Processed))
                            print(f"{c.GREEN}Thanks a lot for your donation{c.RESET}")
                        except:
                            print(f"{c.RED}Failed to send the donation.{c.RESET}")
                        
                        await inquirer.text(message="\nPress ENTER to continue").execute_async()
                    
                await Main_CLI.main_menu()
                return
            case "Exit CLI":
                print("\nBye!")
                for p in snipers_processes:
                    p.terminate()
                time.sleep(1)
                exit()
        

if __name__ == "__main__":
    print(f"{c.BLUE}STARTING CLI...{c.RESET}")
    asyncio.run(Token_Sniper.run())
    asyncio.run(Main_CLI.start_CLI())
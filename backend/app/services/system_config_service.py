import json
import os

CONFIG_PATH = "uploads/config/system_config.json"


def get_system_config():
    if not os.path.exists(CONFIG_PATH):
        return {
            "smtp_email": None,
            "smtp_password": None
        }

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_system_config(data: dict):
    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)

    current = get_system_config()
    current.update(data)

    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(current, f, indent=4)

    return current
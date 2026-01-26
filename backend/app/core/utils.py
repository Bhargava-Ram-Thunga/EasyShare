import secrets
import string
from typing import Optional


def generate_random_string(length: int = 32) -> str:
    """Generate a random string of specified length"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_share_code(length: int = 9) -> str:
    """
    Generate a random alphanumeric share code
    Excludes confusing characters (O, 0, I, 1)
    """
    characters = string.ascii_uppercase + string.digits
    characters = characters.replace('O', '').replace('0', '').replace('I', '').replace('1', '')
    return ''.join(secrets.choice(characters) for _ in range(length))


def format_file_size(size_bytes: int) -> str:
    """Format file size in human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"


def format_transfer_speed(bytes_per_second: float) -> str:
    """Format transfer speed in human-readable format"""
    return f"{format_file_size(int(bytes_per_second))}/s"


def calculate_time_remaining(remaining_bytes: int, speed_bytes_per_second: float) -> Optional[int]:
    """Calculate estimated time remaining in seconds"""
    if speed_bytes_per_second <= 0:
        return None
    return int(remaining_bytes / speed_bytes_per_second)


def validate_share_code(code: str, expected_length: int = 9) -> bool:
    """Validate share code format"""
    if len(code) != expected_length:
        return False

    # Should only contain uppercase letters and digits (excluding O, 0, I, 1)
    allowed_chars = set(string.ascii_uppercase + string.digits)
    allowed_chars -= {'O', '0', 'I', '1'}

    return all(c in allowed_chars for c in code)

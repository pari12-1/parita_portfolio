import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from root or backend
env_paths = [
    Path(__file__).resolve().parent.parent.parent / '.env',
    Path(__file__).resolve().parent.parent / '.env',
]
for p in env_paths:
    if p.exists():
        load_dotenv(p)
        break

class Settings:
    PROJECT_NAME: str = "AI/ML Developer Portfolio API"
    VERSION: str = "1.0.0"
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")
    
    # LLM keys (optional)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Socials
    CONTACT_EMAIL: str = os.getenv("CONTACT_EMAIL", "developer@pari.ai")
    GITHUB_URL: str = os.getenv("GITHUB_URL", "https://github.com")
    LINKEDIN_URL: str = os.getenv("LINKEDIN_URL", "https://linkedin.com")

settings = Settings()

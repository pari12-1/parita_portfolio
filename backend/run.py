import uvicorn
import os
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows
if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "127.0.0.1")
    print(f">> Starting AI/ML Developer Portfolio Server on http://{host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)

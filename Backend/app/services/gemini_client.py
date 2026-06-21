import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
print(os.getenv("GEMINI_API_KEY"))

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

def call_gemini(prompt: str) -> str:
    response = model.generate_content(prompt)
    return response.text.strip()
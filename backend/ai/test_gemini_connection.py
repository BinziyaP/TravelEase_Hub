
import os
import sys
from dotenv import load_dotenv
import google.generativeai as genai

print("--- Gemini Connection Diagnosis ---")

# 1. Check current directory
print(f"Current Working Directory: {os.getcwd()}")

# 2. Check .env file
env_path = os.path.join(os.getcwd(), '.env')
if os.path.exists(env_path):
    print(f".env file found at: {env_path}")
else:
    print("WARNING: .env file NOT found in current directory!")
    # Try looking in the folder where the script is if different
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path_script = os.path.join(script_dir, '.env')
    if os.path.exists(env_path_script):
        print(f".env file found at script directory: {env_path_script}")
        load_dotenv(env_path_script)
    else:
        print("ERROR: Could not find .env file.")

# Force reload for safety
load_dotenv()

# 3. Check API Key
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print("ERROR: GEMINI_API_KEY not found in environment variables.")
    sys.exit(1)
else:
    masked_key = api_key[:4] + '*' * (len(api_key) - 8) + api_key[-4:]
    print(f"API Key found: {masked_key}")


# 4. Configure Gemini
print("Importing google.generativeai...")
try:
    genai.configure(api_key=api_key)
    print("Configure successful.")
except Exception as e:
    print(f"ERROR: Failed to configure genai: {e}")
    sys.exit(1)

# 4.5 List Models
print("Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"WARNING: Failed to list models: {e}")

# 5. Test Generation
print("Attempting to generate content (Model: gemini-1.5-flash)...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hello, can you hear me?")
    print("--- Response Received ---")
    print(response.text)
    print("--- End Response ---")
    print("SUCCESS: Gemini API is working correctly.")
except Exception as e:
    print(f"ERROR: Failed to generate content: {e}")
    sys.exit(1)

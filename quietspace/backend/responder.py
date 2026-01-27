import os
from openai import OpenAI
from prompt import SYSTEM_PROMPT

# Load API key securely
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_reply(user_text):
    response = client.responses.create(
        model="gpt-4.1-mini",
        input=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": user_text
            }
        ],
        temperature=0.8
    )

    return response.output_text

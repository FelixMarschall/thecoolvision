import base64
import requests
from openai import OpenAI

# https://platform.openai.com/docs/guides/vision


class OpenAIWrapper:
    def __init__(self, api_key):
        self.api_key = api_key
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

    def encode_image(self, image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    def get_payload(self, base64_image):
        return {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "What Food is in this image? Write it as a single word, otherwise two words maximum."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 300
        }

    def process_image(self, image_path) -> str:
        base64_image = self.encode_image(image_path)
        payload = self.get_payload(base64_image)
        response = requests.post(
            "https://api.openai.com/v1/chat/completions", headers=self.headers, json=payload)
        return response.json()['choices'][0]['message']['content']

from openai import OpenAI

# client = OpenAI(api_key='sk-proj-W2nhu2vyRecVfoAoz8QwT3BlbkFJuppyCRB2v6cZdSi9MZ56')
import base64
import requests

# OpenAI API Key
api_key = "sk-proj-W2nhu2vyRecVfoAoz8QwT3BlbkFJuppyCRB2v6cZdSi9MZ56"

# Function to encode the image
def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')

# Path to your image
image_path = "app/test/burger.jpeg"

# Getting the base64 string
base64_image = encode_image(image_path)

headers = {
  "Content-Type": "application/json",
  "Authorization": f"Bearer {api_key}"
}

payload = {
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

response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

print(response.json())

# Big burger image
# {'id': 'chatcmpl-9cVd3tSqBVL4wCB5qJRR5L0zAISj4', 'object': 'chat.completion', 'created': 1718965073, 'model': 'gpt-4o-2024-05-13', 'choices': [{'index': 0, 'message': {'role': 'assistant', 'content': 'The image features a classic cheeseburger with a sesame seed bun, topped with melted cheese, lettuce, pickles, and ketchup. In the background, there are French fries on a plate and a glass of soda with ice, suggesting a typical burger meal setting. The lighting and focus on the burger make it look especially appetizing.'}, 'logprobs': None, 'finish_reason': 'stop'}], 'usage': {'prompt_tokens': 778, 'completion_tokens': 67, 'total_tokens': 845}, 'system_fingerprint': 'fp_9cb5d38cf7'}

# Small burger image
# {'id': 'chatcmpl-9cVrnlnkdGoEIySjnlkizQY1Z4Nnz', 'object': 'chat.completion', 'created': 1718965987, 'model': 'gpt-4o-2024-05-13', 'choices': [{'index': 0, 'message': {'role': 'assistant', 'content': 'Cheeseburger'}, 'logprobs': None, 'finish_reason': 'stop'}], 'usage': {'prompt_tokens': 281, 'completion_tokens': 4, 'total_tokens': 285}, 'system_fingerprint': 'fp_9cb5d38cf7'}
import requests
from urllib.parse import urljoin

class GrocyAPI:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {
            'accept': 'application/json',
            'GROCY-API-KEY': api_key
        }

    def get(self, endpoint):
        url = urljoin(self.base_url, endpoint)
        response = requests.get(url, headers=self.headers)
        # response.raise_for_status()  # Raise an exception if the request failed
        return response.json()
import requests
from urllib.parse import urljoin

class GrocyAPI:
    def __init__(self, base_url, api_key):
        # check if base url and api key have values bigger than 0
        if len(base_url) == 0 or len(api_key) == 0 or base_url is None or api_key is None:
            raise ValueError("base_url and api_key must have values")

        self.base_url = base_url
        self.headers = {
            'accept': 'application/json',
            'GROCY-API-KEY': api_key
        }

    # def get(self, endpoint):
    #     url = urljoin(self.base_url, endpoint)
    #     response = requests.get(url, headers=self.headers)
    #     # response.raise_for_status()  # Raise an exception if the request failed
    #     return response.json()
    
    def get(self, endpoint):
        url = urljoin(self.base_url, endpoint)
        response = requests.request("GET", url, headers=self.headers)
        return response.json()
    
    def post(self, endpoint, data):
        url = urljoin(self.base_url, endpoint)
        response = requests.post(url, headers=self.headers, json=data)
        return response
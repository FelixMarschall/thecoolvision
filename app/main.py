from urllib.parse import urljoin
from flask import Flask, render_template, request, jsonify

import logging
import requests
import yaml
import os
import json

from openapi import OpenAIWrapper
from grocy_api import GrocyAPI

logging.basicConfig(level=logging.DEBUG)

if os.path.isfile("/data/options.json"):
    with open('/data/options.json', "r") as json_file:
        options_config = json.load(json_file)
        grocy_key = options_config['grocy_api_key']
        grocy_url = options_config['grocy_url']
        openai_key = options_config['openai_api_key']
elif os.path.isfile("app/config.yaml"):
    with open('app/config.yaml', 'r') as file:
        config = yaml.safe_load(file)
        grocy_key = config['grocy']['api_key']
        grocy_url = config['grocy']['api_url']
        openai_key = config['openai']['api_key']
else:
    logging.error("No configuration file found")

api = GrocyAPI(grocy_url, grocy_key)
openapi = OpenAIWrapper(openai_key)


# print(openapi.process_image("app/test/burger.jpeg"))

log = logging.getLogger(__name__)
app = Flask(__name__)

# Frontend Routes


@app.route("/")
def index():
    users = api.get("users")

    # filter out user with display_name "admin"
    users = [user for user in users if user["display_name"] != "admin"]

    return render_template("index.html", users=users)


@app.route("/stock", methods=["GET"])
def get_stock():
    stock = api.get("stock")
    if not stock:
        return "No stock available", 404
    return stock, 200

@app.route("/add_product_by_photo" , methods=["POST"])
def add_product_by_photo():
   #get products from master data
   masterdata = api.get("objects/products")
   generated_name = 'PetersErbsen'
   for product in masterdata:
       if product['name'] == generated_name:
           product_id = product['id']
           add_product(product_id)
           #print(product_id)
           break
   else:
       response, status = add_product_to_md(generated_name)
       created_product_id = response['created_object_id']
       #print(created_product_id)
       add_product(created_product_id)

def add_product_to_md(name):
    name #= "New product xyx"
    description = ""
    location_id = 2
    qu_id_purchase = 2 #pack=3 oder Piece=2
    qu_id_stock = 2 #pack=3 oder Piece=2 
    #qu_factor_purchase_to_stock = 1

    data = {
        "name": name,
        "description": description,
        "location_id": location_id,
        "qu_id_purchase": qu_id_purchase,
        "qu_id_stock": qu_id_stock,
        #"qu_factor_purchase_to_stock": qu_factor_purchase_to_stock
    }
    response = api.post(f'objects/products', data)
    #print(response.json())
    return response.json(), 200

def add_product(product_id):
        product_id  # = 8
        amount = 1
        price = 1
        transaction_type = "purchase"
        best_before_date = "2025-01-01"
        

        data = {
            "amount": amount,
            "best_before_date": best_before_date,
            "transaction_type": transaction_type,
            "price": price,
            #'note': "Aaron",
        }

        response = api.post(f'stock/products/{product_id}/add', data)
        #print(response.status_code, response.text)
        return response.json, 200

@app.route("/remove_product", methods=["POST"])
def remove_product():
    with app.app_context():
        product_id = request.form.get('product_id')
        amount = 1
        spoiled = False

        data = {
            "amount": amount,
            "spoiled": spoiled
        }

        response = api.post(f'stock/products/{product_id}/consume', data)
        return response.json, 200



@app.route("/list_products_for_user", methods=["GET"])
def list_products_for_user():
    # get stock
    stock = api.get("stock")
    list_of_entries = []
    # iterate over stock
    for product in stock:
        # get each product id in stock
        product_id = product['product_id']
        # get all entries for each product id
        entries = api.get(f"stock/products/{product_id}/entries")
        # iterate over all entries for a given product
        for entry in entries:
            # create list with product_id and the according user name
            list_of_entries.append([entry['product_id'], entry['note']])

    found_products = []
    ###################################
    user = 'Peter'  # user name from UI needs to be implemented
    # user = request.form.get('username')
    ###################################

    # iterate trough all entries to find 
    for entry in list_of_entries:
        # if note (user name) is equal to the wanted user, the product ids are appended
        if entry[1] == user:
            found_products.append(entry[0])

    #print details for products (not essential)
    for product_id in found_products:
        product = api.get(f"stock/products/{product_id}")
        # here instead of printing the product ids need to be displayed
        # print(product['product']['name'])


@app.route("/process_image", methods=["POST"])
def process_image():
    if "image" not in request.files:
        logging.error("No image file in request")
        return "No image file in request", 400
    file = request.files["image"]
    file.save("thecoolvision/app/temp/image.jpg")
    return "Image data processed successfully", 200

@app.route("/users", methods=["GET"])
def get_users():
    users = api.get("users")
    if not users:
        return "No users available", 404
    return users, 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
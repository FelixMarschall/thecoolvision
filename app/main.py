from urllib.parse import urljoin
from flask import Flask, render_template, request, jsonify

import logging
import yaml
import os
import json

from openapi import OpenAIWrapper
from grocy_api import GrocyAPI

from datetime import datetime, timedelta

logging.basicConfig(level=logging.DEBUG)

if os.path.isfile("app/config.yaml"):
    with open('app/config.yaml', 'r') as file:
        logging.info("Reading yml configuration file")
        config = yaml.safe_load(file)
        grocy_key = config['grocy']['api_key']
        grocy_url = config['grocy']['api_url']
        openai_key = config['openai']['api_key']

if os.path.isfile("/data/options.json") and grocy_key is None and openai_key is None:
    with open('/data/options.json', "r") as json_file:
        logging.info("Using HomeAssistant json configuration file")
        options_config = json.load(json_file)
        grocy_key = options_config['grocy_api_key']
        grocy_url = options_config['grocy_url']
        openai_key = options_config['openai_api_key']
else:
    logging.error("No configuration file found")

api = GrocyAPI(grocy_url, grocy_key)
openapi = OpenAIWrapper(openai_key)

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
    data = request.json
    personName = data.get('personName')
    bestBeforeDate = data.get('bestBeforeDate')
    masterdata = api.get("objects/products")
    generated_name = openapi.process_image("app/temp/image.jpg")
    #generated_name = "PetersErbsen"

    for product in masterdata:
        if product['name'] == generated_name:
            product_id = product['id']
            add_product(product_id, bestBeforeDate, personName) 
            return jsonify({"message": "Product added successfully", "product_id": product_id}), 200 # if function doesnt work, delete this line
    else:
        response, status = add_product_to_md(generated_name)  
        created_product_id = response['created_object_id']
        add_product(created_product_id, bestBeforeDate, personName)
        return jsonify({"message": "Product added successfully", "product_id": created_product_id}), 200 # if function doesnt work, delete this line


def add_product_to_md(name):
    description = ""
    location_id = 2
    qu_id_purchase = 2 #pack=3 oder Piece=2
    qu_id_stock = 2 #pack=3 oder Piece=2 

    data = {
        "name": name,
        "description": description,
        "location_id": location_id,
        "qu_id_purchase": qu_id_purchase,
        "qu_id_stock": qu_id_stock,
    }
    response = api.post(f'objects/products', data)
    #print(response.json())
    return response.json(), 200


def add_product(product_id, bestBeforeDate, personName):
        amount = 1
        price = 1
        transaction_type = "purchase"
        best_before_date = bestBeforeDate
        person = personName

        data = {
            "amount": amount,
            "best_before_date": best_before_date,
            "transaction_type": transaction_type,
            "price": price,
            "note": personName,
            # "userfield": 
            # { "person": person },# ToDO: wird userfield so richtig übergeben?
        }

        response = api.post(f'stock/products/{product_id}/add', data)
        #print(response.status_code, response.text)
        return response.json, 200

############# this remove function is working #############  
@app.route('/remove_product', methods=['POST'])
def remove_product():
    data = request.json
    product_id = int(data.get('productId'))
    #product_id = request.form.get('productIdToRemoveInt')
    #product_id_int = int(product_id)
    #product_id = int(request.form.get('productIdToRemoveInt'))
    # try:
    #     product_id = int(request.form.get('productIdToRemove'))  
    # except (ValueError, TypeError):
    #     return jsonify({"error": "product_id invalid"}), 400
    
    amount = 1
    spoiled = False

    data = {
        "amount": amount,
        "spoiled": spoiled
    }

    response = api.post(f'stock/products/{product_id}/consume', data)

    if response.status_code < 200 or response.status_code >= 300:
        logging.info(f"Product with ID {product_id} could not be removed")
    return response.json(), 200


##################### remove function with user/note check #####################
# def remove_product():
#     data = request.json
#     user_name = data.get('userName')  # Assuming the user's name is passed in the request
#     product_id = int(data.get('productId'))

#     # Step 1: Fetch all products with the given product ID
#     products = api.get(f'stock/products/{product_id}/entries')

#     # Step 2: Iterate over the products
#     for product in products:
#         # Step 3: Check if the product belongs to the user
#         if 'note' in product and product['note'] == user_name:
#             # Found the product belonging to the user; proceed with removal
#             amount = 1
#             spoiled = False
#             data = {
#                 "amount": amount,
#                 "spoiled": spoiled
#             }
#             # Here we are assuming each product has a unique identifier within the list of products with the same ID
#             # This is necceassary to identify the specific product to remove
#             response = api.post(f'stock/products/{product["unique_identifier"]}/consume', data)
#             return response.json(), 200

#     # If no product belonging to the user was found
#     return jsonify({"error": "No product found for the user"}), 404
##################### remove function with user/note check #####################

##################### remove function for userfield (unfinished) #####################
# @app.route("/list_products_for_user", methods=["GET"])
# def list_products_for_user():
#     # get stock
#     stock = api.get("stock")
#     list_of_products = []
#     # iterate over stock
#     for product in stock:
#         # get each userfield in stock
#         person = product["userfields"]
#         list_of_products.append([])

        
#         # get all entries for each product id
#         entries = api.get(f"stock/products/{product_id}/entries")
#         # iterate over all entries for a given product
#         for entry in entries:
#             # create list with product_id and the according user name
#             list_of_entries.append([entry['product_id'], entry['note']])

#     found_products = []
#     ###################################
#     #user = 'Peter'  # user name from UI needs to be implemented
#     user = request.form.get('PersonName')
#     ###################################

#     # iterate trough all entries to find 
#     for entry in list_of_products:
#         # if note (user name) is equal to the wanted user, the product ids are appended
#         if entry[1] == user:
#             found_products.append(entry[0])

#     #print details for products (not essential)
#     for product_id in found_products:
#         product = api.get(f"stock/products/{product_id}")
#         # here instead of printing the product ids need to be displayed
#         # print(product['product']['name'])
#     return found_products, 200
##################### remove function for userfield (unfinished) #####################

@app.route("/user/<personName>/products", methods=["GET"])
def list_products_for_user(personName: str):
    raw_stocks = api.get("objects/stock") # <-- has the note or person field
    raw_products = api.get("objects/products")
    
    list_of_entries = []
    for stock in raw_stocks:
        list_of_entries.append((stock['product_id'], stock['note'], stock['best_before_date']))

    # remove touple duplicates from list
    list_of_entries = list(set(list_of_entries))

    # only keep entries with the wanted user
    list_of_entries = [entry for entry in list_of_entries if entry[1] == personName]
    
    found_products = []

    for entry in list_of_entries:
        for product in raw_products:
            if entry[0] == product['id']:
                found_products.append({"id": product['id'], "name": product['name'], "best_before_date": entry[2]})

    logging.debug(f"Found products for user {personName}: {found_products}")
    return found_products, 200

@app.route("/process_image", methods=["POST"])
def process_image():
    if "image" not in request.files:
        logging.error("No image file in request")
        return "No image file in request", 400
    file = request.files["image"]
    file.save("app/temp/image.jpg")
    logging.info("Image saved successfully")
    return "Image data processed successfully", 200

@app.route("/users", methods=["GET"])
def get_users():
    users = api.get("users")
    if not users:
        return "No users available", 404
    return users, 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
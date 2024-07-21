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
grocy_url = None
grocy_key = None
openai_key = None
if os.path.isfile("app/config.yaml"):
    with open('app/config.yaml', 'r') as file:
        logging.info("Reading yml configuration file")
        config = yaml.safe_load(file)
        grocy_key = config['grocy']['api_key']
        grocy_url = config['grocy']['api_url']
        openai_key = config['openai']['api_key']

elif os.path.isfile("/data/options.json"):
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

# This function checks if the identified product is already in the masterdata.
# If not, it will be added to the masterdata and then added to the stock. 
# If so, it will be added directly to the stock.
@app.route("/add_product_by_photo", methods=["POST"])
def add_product_by_photo():
    data = request.json
    personName = data.get('personName')
    bestBeforeDate = data.get('bestBeforeDate')
    masterdata = api.get("objects/products")
    generated_name = openapi.process_image("app/temp/image.jpg")

    for product in masterdata:
        if product['name'] == generated_name:
            product_id = product['id']
            add_product(product_id, bestBeforeDate, personName)
            # if function doesnt work, delete this line
            return jsonify({"message": "Product added successfully", "product_id": product_id}), 200
    else:
        response, status = add_product_to_md(generated_name)
        created_product_id = response['created_object_id']
        add_product(created_product_id, bestBeforeDate, personName)
        # if function doesnt work, delete this line
        return jsonify({"message": "Product added successfully", "product_id": created_product_id}), 200

# This functions adds a product to the masterdata by its name.
def add_product_to_md(name):
    description = ""
    location_id = 2
    qu_id_purchase = 2  # pack = 3 or Piece = 2
    qu_id_stock = 2     # pack = 3 or Piece = 2

    data = {
        "name": name,
        "description": description,
        "location_id": location_id,
        "qu_id_purchase": qu_id_purchase,
        "qu_id_stock": qu_id_stock,
    }
    response = api.post(f'objects/products', data)
    return response.json(), 200

# This function adds a product to the stock by its product ID.
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
    }

    response = api.post(f'stock/products/{product_id}/add', data)
    return response.json, 200

# This function removes a product from the stock by its product ID.
@app.route('/remove_product', methods=['POST'])
def remove_product():
    data = request.json
    product_id = int(data.get('productId'))
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


# This function lists all products for a specific user.
@app.route("/user/<personName>/products", methods=["GET"])
def list_products_for_user(personName: str):
    raw_stocks = api.get("objects/stock")  # <-- has the note or person field
    raw_products = api.get("objects/products")

    list_of_entries = []
    for stock in raw_stocks:
        list_of_entries.append(
            (stock['product_id'], stock['note'], stock['best_before_date']))

    # remove touple duplicates from list
    list_of_entries = list(set(list_of_entries))

    # only keep entries with the wanted user
    list_of_entries = [
        entry for entry in list_of_entries if entry[1] == personName]

    found_products = []

    for entry in list_of_entries:
        for product in raw_products:
            if entry[0] == product['id']:
                found_products.append(
                    {"id": product['id'], "name": product['name'], "best_before_date": entry[2]})

    logging.debug(f"Found products for user {personName}: {found_products}")
    return found_products, 200

# This function lists all products for all users. 
# So it gives a overview of the whole stock.
@app.route("/users/products", methods=["GET"])
def list_all_products():
    raw_stocks = api.get("objects/stock")
    raw_products = api.get("objects/products")

    list_of_entries = []
    for stock in raw_stocks:
        list_of_entries.append(
            (stock['product_id'], stock['note'], stock['best_before_date']))
    
    # remove touple duplicates from list
    list_of_entries = list(set(list_of_entries))

    all_products = []
    for entry in list_of_entries:
        for product in raw_products:
            if entry[0] == product['id'] and entry[1] is not None:
                all_products.append(
                    {"id": product['id'], "name": product['name'], "best_before_date": entry[2], "person": entry[1]})
    logging.debug(f"Found all products: {all_products}")

    # sort by person name
    all_products = sorted(all_products, key=lambda x: x['person'])
    return all_products, 200

@app.route("/process_image", methods=["POST"])
def process_image():
    if "image" not in request.files:
        logging.error("No image file in request")
        return "No image file in request", 400
    
    # check if folder exists, if not create it
    if not os.path.exists("app/temp"):
        os.makedirs("app/temp")
        logging.info("Created temp folder")
    
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

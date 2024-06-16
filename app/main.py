from urllib.parse import urljoin
from flask import Flask, render_template, request

import logging
import requests

from grocy_api import GrocyAPI

logging.basicConfig(level=logging.DEBUG)

api = GrocyAPI('https://grocy.softghost.dev/api/', 'My6mrvmlS75bzb7WPKE6YIFly4ZM3xILaqXY5DP0pzMwqdTRd3')


log = logging.getLogger(__name__)
app = Flask(__name__)


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

@app.route("add_product_to_md", methods=["POST"])
def add_product_to_md():
    with app.app_context():
        name = "New product xy"
        description = "asfsfsfsf"
        location_id = 1
        qu_id_purchase = 1
        qu_id_stock = 1
        
        data = {
            "name": name,
            "description": description,
            "location_id": location_id,
            "qu_id_purchase": qu_id_purchase,
            "qu_id_stock": qu_id_stock,
        }

    response = api.post(f'objects/products', data)
    return response.json, 200

@app.route("/add_product", methods=["POST"])
def add_product():
    with app.app_context():
        product_id = request.form.get('product_id')
        amount = 1
        price = 1
        best_before_date = request.form.get('best_before_date')

        data = {
            "amount": amount,
            "best_before_date": best_before_date,
            "price": price
        }

        response = api.post(f'stock/products/{product_id}/add', data)
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


@app.route('/list_products/<user_id>', methods=['GET'])
def list_products(user_id):
    products = grocy.stock()

    #get products for matching user ids
    user_products = [product for product in products if product.user_id == user_id]
    #this needs to be programmed in javascript, so that the user_id is passed to the server
    return render_template("index.html", products=jsonify([product.__dict__ for product in user_products]))


@app.route("/process_image", methods=["POST"])
def process_image():
    if "image" not in request.files:
        logging.error("No image file in request")
        return "No image file in request", 400
    file = request.files["image"]
    file.save("app/temp/image.jpg")
    return "Image data processed successfully", 200

@app.route("/users", methods=["GET"])
def get_users():
    users = api.get("users")
    print(users)
    if not users:
        return "No users available", 404
    return users, 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
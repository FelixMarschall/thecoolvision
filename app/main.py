from urllib.parse import urljoin
from flask import Flask, render_template, request

import logging
import requests

from app.grocy_api import GrocyAPI

logging.basicConfig(level=logging.DEBUG)

api = GrocyAPI('https://grocy.softghost.dev/api', 'My6mrvmlS75bzb7WPKE6YIFly4ZM3xILaqXY5DP0pzMwqdTRd3')


log = logging.getLogger(__name__)
app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/stock", methods=["GET"])
def get_stock():
    stock = api.get("stock")
    if not stock:
        return "No stock available", 404
    return stock, 200


@app.route("/add_product", methods=["POST"])
def add_product():
    pass    


@app.route("/remove_product", methods=["POST"])
def remove_product():
    pass


@app.route("/process_image", methods=["POST"])
def process_image():
    if "image" not in request.files:
        logging.error("No image file in request")
        return "No image file in request", 400
    file = request.files["image"]
    file.save("app/temp/image.jpg")
    return "Image data processed successfully", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)

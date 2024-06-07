# app.py

from flask import Flask, render_template, request
import cv2
import logging
import os
import time
import magic
from pygrocy import Grocy
from grocy_api import GrocyAPI

logging.basicConfig(level=logging.DEBUG)

log = logging.getLogger(__name__)
app = Flask(__name__)

api = GrocyAPI('https://grocy.softghost.dev/api', 'My6mrvmlS75bzb7WPKE6YIFly4ZM3xILaqXY5DP0pzMwqdTRd3')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_product', methods=['POST'])
def add_product():
    product_id = request.form.get('product_id')
    amount = 1
    price = 1
    best_before_date = request.form.get('best_before_date')

    #add product to db
    grocy.add_product(grocy, product_id, amount, price, best_before_date)

    #list_products needs product.user_id, so somehow we need to add a user_id to the product

@app.route('/remove_product/<product_id>', methods=['POST'])
def remove_product(product_id):
    product_id = request.form.get('product_id')
    amount = 1
    spoiled = False

    #remove product from db
    grocy.consume_product(grocy, product_id, amount, spoiled)

@app.route('/list_products/<user_id>', methods=['GET'])
def list_products(user_id):
    products = grocy.stock()

    #get products for matching user ids
    user_products = [product for product in products if product.user_id == user_id]
    #this needs to be programmed in javascript, so that the user_id is passed to the server
    return jsonify([product.__dict__ for product in user_products])

i = 0
@app.route('/process_video', methods=['POST'])
def process_video():
    log.debug('Processing video data: %s', request.files)
    
    # Check if 'video' file is present in the request
    if 'video' not in request.files:
        logging.error('No video file in request')
        return 'No video file in request', 400
    
    try:
        video_file = request.files['video']
        log.debug('Video file: %s', video_file)

        # Save the video file to disk
        global i
        i = i + 1
        # video_path = str(i) + 'webcam_stream.webm'
        video_path = 'app/temp/webcam_stream.webm'
        

        video_file.save(video_path)

        # Check the file size
        file_size = os.path.getsize(video_path)
        if file_size == 0:
            log.error('Empty video file')
            return 'Empty video file', 400

        # # Check the file format
        # mime_type = magic.from_file(video_path, mime=True)
        # if mime_type != 'video/webm':
        #     log.error('Invalid file format: %s', mime_type)
        #     return 'Invalid file format', 400

        # Open the video file
        cap = cv2.VideoCapture(video_path)
        ret, frame = cap.read()

        if ret:
            cv2.imwrite('app/temp/' + str(i) + 'webcam_frame.jpg', frame)
            cap.release()

        log.info('Video data processed successfully')
        return 'Video data processed successfully', 200
    except Exception as e:
        log.error(f'Error processing video data: {e}')
        return f'Error processing video data: {e}', 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
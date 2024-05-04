# app.py

from flask import Flask, render_template, request
import cv2
import logging
import os
import time

logging.basicConfig(level=logging.DEBUG)

log = logging.getLogger(__name__)
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_video', methods=['POST'])
def process_video():
    log.debug('Processing video data: %s', request.files)
    
    # Check if 'video' file is present in the request
    if 'video' not in request.files:
        logging.error('No video file in request')
        return 'No video file in request', 400
    
    try:
        time.sleep(1)
        video_file = request.files['video']
        log.debug('Video file: %s', video_file)

        # Save the video file to disk
        video_path = 'webcam_stream.webm'
        video_file.save(video_path)

        # Open the video file
        cap = cv2.VideoCapture(video_path)
        ret, frame = cap.read()

        if ret:
            cv2.imwrite('webcam_frame.jpg', frame)
            cap.release()

        log.info('Video data processed successfully')
        exit()
        return 'Video data processed successfully', 200
    except Exception as e:
        log.error(f'Error processing video data: {e}')
        return f'Error processing video data: {e}', 500

if __name__ == '__main__':
    app.run(debug=True)

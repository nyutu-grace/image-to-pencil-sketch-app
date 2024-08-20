from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image

app = Flask(__name__)
CORS(app)

def convert_to_sketch(image):
    # Convert the image to grayscale
    grey_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Invert the grayscale image
    inverted_image = cv2.bitwise_not(grey_image)

    # Blur the image by using a Gaussian function
    blurred = cv2.GaussianBlur(inverted_image, (21, 21), sigmaX=0, sigmaY=0)

    # Invert the blurred image
    inverted_blur = cv2.bitwise_not(blurred)

    # Create the pencil sketch by dividing the grayscale image by the inverted blurry image
    sketch = cv2.divide(grey_image, inverted_blur, scale=256.0)

    return sketch

@app.route('/upload', methods=['POST'])
def upload_image():
    file = request.files['image']
    img = Image.open(file.stream)
    img = np.array(img)

    sketch = convert_to_sketch(img)

    # Convert sketch back to image
    sketch_pil = Image.fromarray(sketch)

    # Save the sketch to a BytesIO object
    buffered = BytesIO()
    sketch_pil.save(buffered, format="JPEG")
    sketch_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return jsonify({"sketch": sketch_base64})

if __name__ == '__main__':
    app.run(debug=True)

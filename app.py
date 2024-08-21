from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import torch
from torchvision import transforms

app = Flask(__name__)
CORS(app)

def convert_to_sketch(image):
    grey_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    inverted_image = cv2.bitwise_not(grey_image)
    blurred = cv2.GaussianBlur(inverted_image, (21, 21), sigmaX=0, sigmaY=0)
    inverted_blur = cv2.bitwise_not(blurred)
    sketch = cv2.divide(grey_image, inverted_blur, scale=256.0)
    return sketch

def convert_to_anime(image):
    # Load the pre-trained AnimeGAN2 model
    model = torch.hub.load('bryandlee/animegan2-pytorch:main', 'generator', pretrained=True)
    model.eval()

    # Transform image for the model
    transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
        transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
    ])
    input_image = transform(image).unsqueeze(0)

    # Generate the anime-style image
    with torch.no_grad():
        output_image = model(input_image)

    output_image = output_image.squeeze(0).cpu().numpy()
    output_image = (output_image * 0.5 + 0.5) * 255
    output_image = output_image.astype(np.uint8)
    output_image = output_image.transpose(1, 2, 0)  # Convert to HWC format

    return output_image

@app.route('/upload', methods=['POST'])
def upload_image():
    file = request.files['image']
    img = Image.open(file.stream)
    img_np = np.array(img)

    # Convert to sketch
    sketch = convert_to_sketch(img_np)
    sketch_pil = Image.fromarray(sketch)
    buffered_sketch = BytesIO()
    sketch_pil.save(buffered_sketch, format="JPEG")
    sketch_base64 = base64.b64encode(buffered_sketch.getvalue()).decode('utf-8')

    return jsonify({"sketch": sketch_base64})

@app.route('/upload_anime', methods=['POST'])
def upload_anime():
    file = request.files['image']
    img = Image.open(file.stream).convert('RGB')  # Ensure image is in RGB format

    # Convert to anime
    anime_image = convert_to_anime(img)
    anime_pil = Image.fromarray(anime_image)
    buffered_anime = BytesIO()
    anime_pil.save(buffered_anime, format="JPEG")
    anime_base64 = base64.b64encode(buffered_anime.getvalue()).decode('utf-8')

    return jsonify({"anime": anime_base64})

if __name__ == '__main__':
    app.run(debug=True)


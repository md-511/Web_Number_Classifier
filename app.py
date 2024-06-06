from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np

model = tf.keras.models.load_model('./weights/my_model.h5')

app = Flask(__name__)
CORS(app)

@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.json
    img = data['data']

    for i in range(len(img)):
        for j in range(len(img[i])):
            img[i][j] /= 255

    img = np.array(img)
    img = img.reshape(1, 28, 28, 1)
    prediction = model.predict(img)

    return jsonify({'prediction': prediction.tolist()}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

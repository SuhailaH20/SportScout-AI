import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from predictor import PlayerPredictor  # تأكد من وجود هذا الملف

app = Flask(__name__, template_folder=os.path.join('views', 'components'))
CORS(app)

predictor = PlayerPredictor()

@app.route('/')
def home():
    return render_template('dashboard.ejs')  # تأكد من وجود dashboard.ejs في المسار الصحيح

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not all(key in data for key in ['goals', 'assists', 'rating', 'matches']):
            return jsonify(error="Missing data fields"), 400
        
        player_data = {
            'Goals': float(data['goals']),
            'Assists': float(data['assists']),
            'Seasons Ratings': float(data['rating']),
            'Matches': float(data['matches'])
        }
        
        result = predictor.predict(player_data)  # تأكد من أن هذه الدالة تعيد النتائج بالشكل الصحيح
        return jsonify(result=result)
    except Exception as e:
        return jsonify(error=str(e)), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)


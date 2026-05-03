from flask import Flask, jsonify
import json
import os

app = Flask(__name__)

# Serve the homepage from the static folder
@app.route('/')
def home():
    return app.send_static_file('index.html')

# Serve the play page from the static folder
@app.route('/play')
def play():
    return app.send_static_file('play.html')

# Path to the quiz data file relative to this file's location
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'quizzes.json')

# Load all quizzes from the JSON data file and return an empty list if the file doesn't exist
def load_quizzes():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r') as f:
        return json.load(f)
    
# Return a summary list of all quizzes in data file (id, title, description, question count)
@app.route('/api/quizzes')
def get_quizzes():
    quizzes = load_quizzes()
    summary = [
        {
            'id': quiz['id'],
            'title': quiz['title'],
            'description': quiz.get('description', ''),
            'question_count': len(quiz['questions'])
        }
        for quiz in quizzes
    ]
    return jsonify(summary)

if __name__ == '__main__':
    app.run(debug=True)